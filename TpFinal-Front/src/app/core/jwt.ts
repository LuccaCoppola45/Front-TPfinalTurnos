import { Token } from "@angular/compiler";



// Esta es la forma esperada del payload
interface PayloadJwt{
    sub?: string; //Este campo es opcional y lo usamos como posible email
    exp?: number;//Este campo tambien es opcionas y se espera el numero de cuando expira el token
}


function leerPayLoad(token:string): PayloadJwt | null { //Recibe una token como texto y puede devolver un payload o null
    try {
        const parte = token.split('.')[1];//Esto divide el token usando los puntos y guarda la segunda parte
        const base64= parte.replace(/-/g, '+').replace(/_/g, '/'); //Convierte los caracteres especiales de 
                                                                    //Base64 URL a los caracteres de Base64 estándar:
        return JSON.parse(atob(base64)) as PayloadJwt
    }catch{
        return null
    }
}

export function emailDelToken(token : string | null): string | null{  //Esta funcion tambien recibe un token como string 
    if(!token){
        return null
    }//Devuelve un texto o null

    return leerPayLoad(token)?.sub ?? null; //?.sub evita un error si leerPayLoad devolvió null.
//?? null hace que el resultado sea null si el valor obtenido es null o undefined.
}

export function tokenVencido(token: string): boolean {
  const exp = leerPayLoad(token)?.exp;
  return !exp || exp * 1000 <= Date.now(); // Esto decide si queda vencido el token exp convierte de segundos a milisegundos
}//Y se comprubea si le fecha de vencimiento ya llego o paso