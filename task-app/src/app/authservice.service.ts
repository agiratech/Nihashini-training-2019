import { Injectable } from '@angular/core';
import { NoteserviceService } from './noteservice.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthserviceService {

  constructor(public auth: NoteserviceService, private http: HttpClient, private router: Router) { }
  email: any;
  password: any;

  registerUser(registerForm) {

    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    console.log('register', registerForm)
    const signUpData = {
      "email": registerForm.email,
      "password": registerForm.password,
      "returnSecureToken": true
    };

    return this.http.post(
      'https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=AIzaSyDLtMOJIzlM9iBe9MPqBBGQFcAMTEKwSVE'
      , signUpData, { headers: headers });


  }
  loginUser(loginForm) {
    const headers = new HttpHeaders({ 'Content-type': 'application/json' })
    console.log('login', loginForm)
    const loginData = {
      "email": loginForm.email,
      "password": loginForm.password,
      "returnSecureToken": true
    };

    return this.http.post('https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=AIzaSyDLtMOJIzlM9iBe9MPqBBGQFcAMTEKwSVE', loginData, { headers: headers })

  }

  sendToken(token: string) {
    localStorage.setItem("LoggedInUser", token)
  }
  getToken() {
    return localStorage.getItem("LoggedInUser")
  }
  isLoggedIn() {
    return this.getToken() !== null;
  }

}
