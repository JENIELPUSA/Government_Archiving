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

exports.DisplayCategory = AsyncErrorHandler(async(req,res)=>{
    const features= new Apifeatures(Category.find(),req.query)
                                .filter()
                                .sort()
                                .limitFields()
                                .paginate()

    const Categorys = await features.query;


    res.status(200).json({
        status:'success',
        data:Categorys
    })

})


exports.UpdateCategory =AsyncErrorHandler(async (req,res,next) =>{
    const updateCategory=await Category.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updateCategory
        
     }); 
  })

  exports.deleteCategory = AsyncErrorHandler(async(req,res,next)=>{

      const hasCategory = await Category.exists({ Category: req.params.id });
    
      if (hasCategory) {
        return res.status(400).json({
          status: "fail",
          message: "Cannot delete Category: there are existing related records.",
        });
      }
    await Category.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })