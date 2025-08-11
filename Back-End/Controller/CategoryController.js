const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Category = require('./../Models/CategorySchema');
const Apifeatures = require('../Utils/ApiFeatures');

exports.createCategory=AsyncErrorHandler(async(req,res) => {
    const Categorys = await Category.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            Categorys
    })

})

exports.DisplayCategory = AsyncErrorHandler(async (req, res) => {
    try {
        const categories = await Category.find();

        res.status(200).json({
            status: 'success',
            data: categories
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            status: 'fail',
            message: 'Something went wrong while fetching categories',
            error: error.message
        });
    }
});


exports.UpdateCategory =AsyncErrorHandler(async (req,res,next) =>{
    const updateCategory=await Category.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updateCategory
        
     }); 
  })

exports.deleteCategory = AsyncErrorHandler(async (req, res, next) => {
  const categoryDoc = await Category.findById(req.params.id);

  if (!categoryDoc) {
    return res.status(404).json({
      status: "fail",
      message: "Category not found.",
    });
  }

  const forbiddenNames = ["resolution", "ordinance"];
  if (forbiddenNames.includes(categoryDoc.category.trim().toLowerCase())) {
    return res.status(400).json({
      status: "fail",
      message: `Cannot delete "${categoryDoc.category}" category.`,
    });
  }

  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    status: "success",
    data: null,
  });
});
