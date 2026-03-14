var express = require('express');
var router = express.Router();
let slugify = require('slugify');
let categoryModel = require('../schemas/categories')

/* GET users listing. */
router.get('/', async function (req, res, next) {
  let data = await categoryModel.find({
    isDeleted: false
  });
  res.send(data);
});
router.get('/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    let result = await categoryModel.find({
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
  let newCate = new categoryModel({
    name: req.body.name,
    slug: slugify(req.body.name, {
      replacement: '-',
      remove: undefined,
      lower: true,
      strict: true
    }),
    image: req.body.image
  })
  await newCate.save()
  res.send(newCate)
})
router.put('/:id', async function (req, res) {

  try {
    let id = req.params.id;
    //c1
    // let result = await categoryModel.findOne({
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
    let result = await categoryModel.findByIdAndUpdate(
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
    let result = await categoryModel.findOne({
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
