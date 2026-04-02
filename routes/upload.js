var express = require("express");
var router = express.Router();
let { uploadExcel, uploadImage } = require('../utils/uploadHandler')
let path = require('path')
let excelJs = require('exceljs')
let categoriesModel = require('../schemas/categories')
let productsModel = require('../schemas/products')
let inventoriesModel = require('../schemas/inventories')
let mongoose = require('mongoose')
let slugify = require('slugify')

router.post('/one_file', uploadImage.single('file'), function (req, res, next) {
    res.send({
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
    })
})
router.post('/multiple_file', uploadImage.array('files', 5), function (req, res, next) {
    console.log(req.body);
    res.send(req.files.map(f => {
        return {
            filename: f.filename,
            path: f.path,
            size: f.size
        }
    }))
})
router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, '../uploads', req.params.filename)
    res.sendFile(pathFile)
})
router.post('/excel', uploadExcel.single('file'), async function (req, res, next) {
    //workbook->worksheet->row/column->cell
    let workBook = new excelJs.Workbook();
    let pathFile = path.join(__dirname, '../uploads', req.file.filename)
    await workBook.xlsx.readFile(pathFile)
    let worksheet = workBook.worksheets[0];
    let categories = await categoriesModel.find({})
    let categoriesMap = new Map();
    for (const category of categories) {
        categoriesMap.set(category.name, category.id);
    }
    let getProducts = await productsModel.find({})
    let getSKU = getProducts.map(p => p.sku)
    let getTitle = getProducts.map(p => p.title)
    let result = [];
    let batchsize = 50;
    let maxcommit = Math.ceil(worksheet.rowCount / batchsize);
    for (let commitTime = 0; commitTime < maxcommit; commitTime++) {
        let validProducts = []
        let start = batchsize * commitTime + 1
        let end = Math.min(start + batchsize, worksheet.rowCount)
        let session = await mongoose.startSession();
        session.startTransaction()
        for (let index = start; index <= end; index++) {
            let rowError = [];
            const row = worksheet.getRow(index)
            let sku = row.getCell(1).value;
            let title = row.getCell(2).value;
            let category = row.getCell(3).value;
            let price = Number.parseInt(row.getCell(4).value);
            let stock = Number.parseInt(row.getCell(5).value);

            if (price < 0 || isNaN(price)) {
                rowError.push("price phai la so duong")
            }
            if (stock < 0 || isNaN(stock)) {
                rowError.push("stock phai la so duong")
            }
            if (!categoriesMap.has(category)) {
                rowError.push("category khong hop le")
            }
            if (getSKU.includes(sku)) {
                rowError.push("sku da ton tai")
            }
            if (getTitle.includes(title)) {
                rowError.push("title da ton tai")
            }
            if (rowError.length > 0) {
                result.push({
                    success: false,
                    data: rowError
                })
                continue;
            } else {
                let newProduct = new productsModel({
                    sku: sku,
                    title: title,
                    slug: slugify(title, {
                        replacement: '-',
                        remove: undefined,
                        lower: true,
                        strict: true
                    }),
                    price: price,
                    description: title,
                    category: categoriesMap.get(category),
                })
                getSKU.push(sku);
                getTitle.push(title)
                validProducts.push(newProduct)
            }
        }
        validProducts = await productsModel.insertMany(validProducts);
        await session.commitTransaction();
        await session.endSession()
    }

    // //chia commit -> tách batch
    // //3000 dòng  -> commit 60 lần mỗi lần 50 dòng

    // for (let index = 2; index <= worksheet.rowCount; index++) {

    //     let session = await mongoose.startSession();
    //     session.startTransaction()
    //     try {
    //         let newProduct = new productsModel({
    //             sku: sku,
    //             title: title,
    //             slug: slugify(title, {
    //                 replacement: '-',
    //                 remove: undefined,
    //                 lower: true,
    //                 strict: true
    //             }),
    //             price: price,
    //             description: title,
    //             category: categoriesMap.get(category),
    //         })
    //         await newProduct.save({ session })
    //         let newInventory = new inventoriesModel({
    //             product: newProduct._id,
    //             stock: stock
    //         })
    //         await newInventory.save({ session })
    //         await newInventory.populate('product')
    //         await session.commitTransaction();
    //         await session.endSession()
    //         result.push({
    //             success: true,
    //             data: newInventory
    //         })
    //     } catch (error) {
    //         await session.abortTransaction();
    //         await session.endSession()
    //         result.push({
    //             success: false,
    //             data: error.message
    //         })
    //     }
    // }
    res.send(result)
})
module.exports = router;