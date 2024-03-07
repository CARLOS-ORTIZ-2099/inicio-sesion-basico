const colors = require('colors')
const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface(process.stdin, process.stdout)
const root = './users.json'

function welcomeMessage() {
    console.log('bienvenido que deseas hacer? '.bgBlue);
    console.log('1 : iniciar sesion '.blue);
    console.log('2 : crear cuenta'.blue);
}

function showOptions() {
    rl.question('elige la opcion que desees', (option) => {
        switch(option){
            case ('1'):
                console.log('iniciar sesion'.green);
            break;
            case ('2'):
                console.log('crear cuenta'.green);
              createAccount()
            break;
            default :
            welcomeMessage()
            showOptions()
        }
    })
}

welcomeMessage()
showOptions()

function createAccount() {
    let emailnew
    let passwordnew
    // Uso de la función createEmail
    // primera llamada
    createEmail()
    .then((email) => {
        emailnew = email
        console.log('Correo electrónico válido:'.bgBlue, email);
        createPassword()
            .then((password) => {
                passwordnew = password
                console.log('password válido:'.bgBlue, password)
                console.log(`${emailnew} - ${passwordnew}`);
                insertUserToArray({emailnew, passwordnew})
            } )
    }) 
    .catch((error) => console.log(error)) 
}


function createEmail() {
    return new Promise((resolve, reject) => {
        rl.question('Inserta tu email: ', (emailUser) => {
            // Hacer la validación del email
            if (!validateEmail(emailUser)) {
                console.log('email no válido'.red);
    /* cada que el email no es valido se crea una "ramificacion o instancia" de la funcion que retornara una promesa entonces toca manejarla con then y catch estos toman como parametro el resolve y el reject original, por lo que si llega el punto en el que el usuario introduce un email valido en cualquier instancia o ramificacion de la funcion esta se resolvera con el resolve original ya que Los resolve y reject de todas las instancias o ramificaciones de la promesa están vinculados, afectando así la resolución de la promesa original desde donde se originó la recursión.*/            
                createEmail()
                    .then(resolve) 
                    .catch(reject)
                return;
            }
            // este resolve funge como el caso base de la recursion es decir dejera de llamarse a si misma cuando el email sea valido
            resolve(emailUser); 
        });
    });
}



function createPassword() {
    return new Promise((resolve, reject) => {
        rl.question('inserta tu password', (passwordUser) => {
            if(!validatePassword(passwordUser)){
                console.log('password no valido'.red);
                createPassword()
                    .then(resolve)
                    .catch(reject)
                    return
            }
            resolve(passwordUser)
        })
    })
}


function validatePassword(passwordToEvaluate) {
    if(passwordToEvaluate.trim().length < 5 || passwordToEvaluate.trim().length > 15 ){
        return false
    }
    return true
}


function validateEmail(emailToEvaluate) {
    // creando expresion regular de forma literal
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // evaluando si el email del usuario incluye los caracteres que se indican en la regExp
   if( emailToEvaluate.length > 20  || !emailRegex.test(emailToEvaluate)){
    return false
   }
   return true
}


function insertUserToArray(dataUser) {
   const {taskjson} = getArrayUsers()
    let id = new Date().getTime()
    taskjson.push({...dataUser, id})
    fs.writeFileSync(root, JSON.stringify({"users": taskjson}))
   
}

function getArrayUsers() {
   const arrayUsers = JSON.parse(fs.readFileSync(root, {encoding:'utf-8'}))
   const taskjson = arrayUsers.users || []
   return {taskjson} 
}



