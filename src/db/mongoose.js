const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_LINK, {
    useNewUrlParser: true, 
    useCreateIndex: true
}, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log('Database is connected!')
    }
});


