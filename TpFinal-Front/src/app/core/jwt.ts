import { Token } from "@angular/compiler";

interface PayloadJwt{
    sub?: string;
    exp?: number;
}

function leerPayLoad(token:string): PayloadJwt | null {
    try {
        const parte = token.split('.')[1];
        const base64= parte.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64)) as PayloadJwt
    }catch{
        return null
    }
}

export function emailDelToken(token : string | null): string | null{
    if(!token){
        return null
    }

    return leerPayLoad(token)?.sub ?? null;
}

export function tokenVencido(token: string): boolean {
  const exp = leerPayLoad(token)?.exp;
  return !exp || exp * 1000 <= Date.now();
}