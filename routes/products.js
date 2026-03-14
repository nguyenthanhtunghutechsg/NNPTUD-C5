var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let productModel = require('../schemas/products')

/* GET users listing. */
router.get('/', async function (req, res, next) {
    let queries = req.query;
    let titleQ = queries.title ? queries.title.toLowerCase() :'';
    let max = queries.max ? queries.max : 10000;
    let min = queries.min ? queries.min : 0;
    let data = await productModel.find({
        isDeleted: false,
        title: new RegExp(titleQ,'i'),
        price: {
            $gte: min,
            $lte: max
        }
    }).populate({
        path: 'category',
        select: 'name'
    });
    // data = data.filter(
    //     function (e) {
    //         return e.title.toLowerCase().includes(titleQ) &&
    //             e.price >= min &&
    //             e.price <= max
    //     }
    // )
    res.send(data);
});
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await productModel.find({
            isDeleted: false,
            _id: id
        });
        if (result.length) {
            res.send(result[0])
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});
// router.get('/:id/products', function (req, res, next) {
//   let id = req.params.id;
//   let result = dataCategories.filter(
//     function (e) {
//       return e.id == id && !e.isDeleted;
//     }
//   )
//   if (result.length) {
//     result = dataProducts.filter(
//       function (e) {
//         return e.category.id == id
//       }
//     )
//     res.send(result)
//   } else {
//     res.status(404).send({
//       message: "ID NOT FOUND"
//     })
//   }
// });
//CREATE UPDATE DELETE
router.post('/', async function (req, res) {
    let newProduct = new productModel({
        title: req.body.title,
        slug: slugify(req.body.title, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: true
        }),
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        images: req.body.images
    })
    await newProduct.save()
    res.send(newProduct)
})
router.put('/:id', async function (req, res) {

    try {
        let id = req.params.id;
        //c1
        // let result = await productModel.findOne({
        //   isDeleted: false,
        //   _id: id
        // });
        // if (result) {
        //   let keys = Object.keys(req.body);
        //   for (const key of keys) {
        //     result[key] = req.body[key];
        //   }
        //   await result.save();
        //   res.send(result)
        // } else {
        //   res.status(404).send({
        //     message: "ID NOT FOUND"
        //   })
        // }
        let result = await productModel.findByIdAndUpdate(
            id, req.body, {
            new: true
        })
        res.send(result)

    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})
router.delete('/:id', async function (req, res) {
    try {
        let id = req.params.id;
        let result = await productModel.findOne({
            isDeleted: false,
            _id: id
        });
        if (result) {
            result.isDeleted = true
            await result.save();
            res.send(result)
        } else {
            res.status(404).send({
                message: "ID NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
})

module.exports = router;
