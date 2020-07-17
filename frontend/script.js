function setLoginAction(){
    var loginForm = document.getElementsByName('login-form');

    loginForm[0].action = Config.urlApi + 'login';
}

setLoginAction();