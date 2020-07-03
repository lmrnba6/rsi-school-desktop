import {Injectable} from '@angular/core';
// @ts-ignore
import * as jwt_decode from 'jwt-decode';
import {User} from "../model/user";

const jwt = require('jsonwebtoken');


@Injectable({providedIn: 'root'})
export class AuthenticationService {

    // @ts-ignore
    login(username: string, password: string) {
        return User.verify(username, password);
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('AUTH_TOKEN');
    }

    getToken(): any {
        return localStorage.getItem('AUTH_TOKEN');
    }

    setToken(user: any): void {
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60),
            user
        }, 'auto');
        localStorage.setItem('AUTH_TOKEN', token);
    }

    getCurrentUser() {
        return jwt_decode(this.getToken()).user;
    }

    getTokenExpirationDate(token: string): any {
        const decoded = jwt_decode(token);

        if (decoded.exp === undefined) {
            return null;
        }

        const date = new Date(0);
        date.setUTCSeconds(decoded.exp);
        return date;
    }

    isTokenExpired(token?: string): boolean {
        if (!token) {
            token = this.getToken();
        }
        if (!token) {
            return true;
        }

        const date = this.getTokenExpirationDate(token);
        if (date === undefined) {
            return false;
        }
        return !(date.valueOf() > new Date().valueOf());
    }
}
