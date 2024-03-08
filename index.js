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
    rl.question('elige la opcion que desees\n', (option) => {
        switch(option){
            case ('1'):
                console.log('iniciar sesion'.green);
                initSession()
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


function initSession() {

}

function createAccount() {
    let emailnew
    let passwordnew
    // Uso de la función createEmail
    // primera llamada
    createEmail()
    .then((email) => {
        emailnew = email
        console.log('Correo electrónico válido:'.bgBlue, email);
        return createPassword()
    })
    .then((password) => {
        passwordnew = password
        console.log('password válido:'.bgBlue, password)
        console.log(`${emailnew} - ${passwordnew}`);
        insertUserToArray({emailnew, passwordnew})
    }) 
    .catch((error) => console.log(error)) 
}


function createEmail() {
    return new Promise((resolve, reject) => {
        rl.question('Inserta tu email: ', (emailUser) => {
            // Hacer la validación del email
            if (!validateEmail(emailUser)) {
               // console.log('email no válido'.red);
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
        rl.question('inserta tu password ', (passwordUser) => {
            if(!validatePassword(passwordUser)){
               // console.log('password no valido'.red);
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
        console.log(`el password debe de tener por lo menos 5 caracteres y maximo 15`.red)
        return false
    }
    return true
}


function validateEmail(emailToEvaluate) {
    // creando expresion regular de forma literal
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // evaluando si el email del usuario incluye los caracteres que se indican en la regExp
    if( emailToEvaluate.length > 20  || !emailRegex.test(emailToEvaluate)){
        console.log(`el email no cumple con ser un email`.red);
        return false
    }

   // tambien validar si el email no esta registrado ya en la DB
    else if(exitsEmail(emailToEvaluate) >= 0){
        console.log(`no puedes crear una cuenta con un correo ya registrado ${exitsEmail(emailToEvaluate)}`.red);
        return false
    }
    

    return true
}

// funcion para validar la existencia del email en la DB
function exitsEmail(email) {
    // obtener los datos de la Db
    const {taskjson} = getArrayUsers()
   // console.log(taskjson);
    let min = 0
    let max = taskjson.length - 1
    let half = Math.floor((min+max)/2)

    console.log(`la mitad es ${half}` .bgCyan);

    while(min <= max) {
        half = Math.floor((min+max)/2)
        console.log(`iterando n veces`.bgBlue);
        if(taskjson[half].emailnew === email){
            return half
        }
        else if(taskjson[half].emailnew < email){
            min = half + 1
        }else{
            max = half -1 
        }
    }
    return - 1
    /* for(let i = min; i<=half; i++){
        console.log(`iterando ${i + 1} veces`.bgBlue);
        if(taskjson[i].emailnew === email ){
           // console.log(`es igual ${i}`);
            return i
        }
        else if(taskjson[max - i].emailnew === email) {
            //console.log(`es igual ${max - i}`);
            return max - i
        }
    } 
    return -1 */
}


function insertUserToArray(dataUser) {
    const {taskjson} = getArrayUsers()
    let id = new Date().getTime()
    taskjson.push({...dataUser, id})
    const newArray = mergeSort(taskjson, 0, taskjson.length-1)
    fs.writeFileSync(root, JSON.stringify({"users": newArray}))
   
}



function getArrayUsers() {
   const arrayUsers = JSON.parse(fs.readFileSync(root, {encoding:'utf-8'}))
   const taskjson = arrayUsers.users || []
   return {taskjson} 
}

// funcion que se encarga de bisecar el arreglo hasta llegar al caso base
function mergeSort(array, min, max) {
    if(min < max){
        let half = Math.floor((min+max)/2)
        // llamar recursivamente
        mergeSort(array, min, half)
        mergeSort(array, half + 1, max)
        merge(array, min, half, max)
    }
    // caso contrario retornar el arreglo
    return array
}


// funcion que se encarga de comparar y mezclar
function merge(array, min, half, max) {
    let tempo = []
    // creando varaibels que indexen las posiciones inciales de los arreglo izquierdo y derecho
    let left = min
    let right = half + 1
    // hacer la comparacion entre elementos de la izquierda y la deracha mientras
    // minetras los indices iniciales no sobrepasen el maximo permitido
    while(left <= half && right <= max) {
        // comparar
        if(array[left].emailnew <= array[right].emailnew){
            tempo.push(array[left])
            left++
        }else{
            tempo.push(array[right])
            right++
        }
    }    

    // seguir iterando mientras cualuqiera de los arreglos tenga elementos sobrantes
    while(left <= half) {
        tempo.push(array[left])
        left++
    }
    while(right <= max) {
        tempo.push(array[right])
        right++
    }

    // pasar todos los elementos de array temporal al array original
    for(let i = min; i <= max; i++){
        array[i] = tempo[i -min]
    }

}

