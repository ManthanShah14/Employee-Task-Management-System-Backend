export const authEndpoints = Object.freeze({
    login:"/login",
    logout:"/logout",
    changePassword:"/changePassword/:id"
})

export const adminEndpoints = Object.freeze({
    createEmployee:"/createEmployee",
    getAllEmployees:"/getAllEmployees",
    updateEmployee:"/updateEmployee/:id",
    deleteEmployee:"/deleteEmployee/:id",
    getEmployeeById:"/getEmployeeById/:id",
    reactivateEmployee:"/reactivateEmployee/:id",
    deactivateEmployee:"/deactivateEmployee/:id",
})
export const employeeEndpoints = Object.freeze({
    getMyDetails:"/getMyDetails",
    updateMyDetails:"/updateMyDetails"
})

export const adminTasksEndPoints = Object.freeze({
    getAllTasks:"/getAllTasks",
    getTaskById:"/getTaskById/:id",
    createTaskById:"/createTaskById/:id",
    updateTaskById:"/updateTaskById/:id",
    deleteTaskById:"/deleteTaskById/:id",
    getTasksByEmployeeId:"/getTasksByEmployeeId/:id",
    deleteTasksByEmployeeId:"/deleteTasksByEmployeeId/:id"
})

export const employeeTaskEndPoints = Object.freeze({
 getMyTask:"/getMyTask",
    updateMyTask:"/updateMyTask"
})