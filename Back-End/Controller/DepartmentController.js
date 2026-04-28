const AsyncErrorHandler = require('../Utils/AsyncErrorHandler');
const Department = require('./../Models/DepartmentSchema');
const Apifeatures = require('../Utils/ApiFeatures');

exports.createDepartment=AsyncErrorHandler(async(req,res) => {
    const Departments = await Department.create(req.body);
    res.status(201).json({
        status:'success',
        data:
            Departments
    })

})

exports.DisplayDepartment = AsyncErrorHandler(async (req, res) => {
  try {
    const Departments = await Department.find();

    res.status(200).json({
      status: "success",
      data: Departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong while fetching departments.",
      error: error.message,
    });
  }
});



exports.UpdateDepartment =AsyncErrorHandler(async (req,res,next) =>{
    const updateCategory=await Department.findByIdAndUpdate(req.params.id,req.body,{new: true});
     res.status(200).json({
        status:'success',
        data:
            updateCategory
        
     }); 
  })

  exports.deleteDepartment = AsyncErrorHandler(async(req,res,next)=>{

      const hasCategory = await Department.exists({ Category: req.params.id });
    
      if (hasCategory) {
        return res.status(400).json({
          status: "fail",
          message: "Cannot delete Category: there are existing related records.",
        });
      }
    await Department.findByIdAndDelete(req.params.id)

    res.status(200).json({
        status:'success',
        data:
            null
        
     });
  })