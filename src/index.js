const express = require('express');
require('./db/mongoose');
const userRouter = require('./router/user');
const taskRouter = require('./router/task');



const app = express();

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)




app.listen(process.env.PORT, () => {
    console.log('Server started on port ' + process.env.PORT)
})


const User = require('./models/User')
const Task = require('./models/Task')

// console.log('Good')

// function main() {

//     try {

//         Task.findById('5d431d5741c240aa7c37dd02').populate('owner').execPopulate().then((r) => {
//             console.log(r)
//         })

//         User.findById('5d41da7bfd08e5a54dec89f8').populate('tasks').execPopulate((e, r) => {
//             console.log(e)
//         })
        

        
//     } catch (error) {
//         console.log(error)
//     }



// }


// main()
