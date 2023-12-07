
let contentScrollPosition = 0;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Views rendering

function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='images/Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function updateHeader(title, command) {

    switch (command) {
        case 'createProfil':
            $('.viewTitle').text(title);
            headerAnonymous();
            break;
        case 'login':
            $('.viewTitle').text(title);
            headerAnonymous();
            break;
        case 'about':
            $('.viewTitle').text(title);
            break;
        case 'loggedAddPhoto': // celui la ne retire pas le petit -> (+) pour ajouter photo a partir de header
            headerLogged();
            break;
        case 'logged':
            headerLogged();
            $('.viewTitle').text(title);
        default:
            break;
    }
}
function headerAnonymous() {
    $("#header").html(`
    <span title="Liste des photos" id="listPhotosCmd">
        <img src="images/PhotoCloudLogo.png" class="appLogo">
    </span>
    <span class="viewTitle">Connexion
    </span>
    <div class="dropdown ms-auto dropdownLayout">
        <div data-bs-toggle="dropdown" aria-expanded="false">
            <i class="cmdIcon fa fa-ellipsis-vertical"></i>
        </div>
        <div class="dropdown-menu noselect" id="DDMenu">
            <div class="dropdown-item menuItemLayout" id="signInCmd">
                <i class="menuIcon fa fa-sign-in mx-2"></i> Connexion
            </div>
            <div class="dropdown-item menuItemLayout" id="aboutCmd">
                <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
            </div>
        </div>
    </div>`);
    $('#aboutCmd').click(() => { renderAbout(); });
    $('#signInCmd').click(() => { renderFormConnection(); });
}
function headerLogged() {
    let loggedUser = API.retrieveLoggedUser();
    let isAdmin = loggedUser.Authorizations.readAccess === 2 && loggedUser.Authorizations.writeAccess === 2;

    $('#header').html( `
        <span title="Liste des photos" id="listPhotosCmd">
        <img src="images/PhotoCloudLogo.png" class="appLogo">
        </span>
        <span class="viewTitle">Liste des photos
            <div class="cmdIcon fa fa-plus" id="newPhotoCmd" title="Ajouter une photo"></div>
        </span>
        <div class="headerMenusContainer">
        <span>&nbsp;</span> <!--filler-->
        <i title="Modifier votre profil">
        <div class="UserAvatarSmall" userid="${loggedUser.Id}" id="editProfilCmd"
        style="background-image:url('${loggedUser.Avatar}')"
        title="Nicolas Chourot"></div>
        </i>
        <div class="dropdown ms-auto dropdownLayout">
            <div data-bs-toggle="dropdown" aria-expanded="false">
                <i class="cmdIcon fa fa-ellipsis-vertical"></i>
            </div>
            <div class="dropdown-menu noselect" id="DDMenu">
            ${isAdmin ?
            `
                <div class="dropdown-item menuItemLayout" id="manageUserCm">
                    <i class="menuIcon fas fa-user-cog"></i> Gestion des usagers
                </div> <hr>`
            : ""}
                <div class="dropdown-item menuItemLayout" userId='${loggedUser.Id}' id="signOutCmd">
                    <i class="menuIcon fa fa-sign-out"></i> Deconnexion
                </div>
                <div class="dropdown-item menuItemLayout" id="editProfilCmd2">
                    <i class="menuIcon fas fa-edit"></i> Modifiez votre profil
                </div>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="listPhotosMenuCmd">
                <i class="menuIcon fa fa-image mx-2"></i>
                Liste des photos
                </span>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="sortByDateCmd">
                <i class="menuIcon fa fa-check mx-2"></i>
                <i class="menuIcon fa fa-calendar mx-2"></i>
                Photos par date de création
                </span>
                <span class="dropdown-item" id="sortByOwnersCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-users mx-2"></i>
                Photos par créateur
                </span>
                <span class="dropdown-item" id="sortByLikesCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-user mx-2"></i>
                Photos les plus aiméés
                </span>
                <span class="dropdown-item" id="ownerOnlyCmd">
                <i class="menuIcon fa fa-fw mx-2"></i>
                <i class="menuIcon fa fa-user mx-2"></i>
                Mes photos
                </span>
                <div class="dropdown-divider"></div>
                <span class="dropdown-item" id="aboutCmd">
                    <i class="menuIcon fa fa-info-circle mx-2"></i>
                    À propos...
                </span>

                
            </div>
        </div>
    `);

    // on profil photo click
    connectedUserEvents(loggedUser);
    $('#aboutCmd').click(() => { renderAbout(); });
    if(isAdmin){
        $('#manageUserCm').click(()=>renderUsersList())
    }
}

function connectedUserEvents(loggedUser) {
    if(loggedUser.VerifyCode === 'verified') {
        $('#editProfilCmd, #editProfilCmd2').click(() => {
            renderEditProfil(API.retrieveLoggedUser());
        });
    }
    
    $('#signOutCmd').click(async (e) => {
        showWaitingGif();
        if (await API.logout()) {
            console.log('deconnexion reussie');
            renderFormConnection(null);
        }
    });
}

function renderAbout() {
    timeout();
    saveContentScrollPosition();
    updateHeader("À propos...", "about");

    $("#content").html(
        `
            <div class="aboutContainer">
                <h2>Gestionnaire de photos</h2>
                <hr>
                <p>
                    Petite application de gestion de photos multiusagers à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `);
}

function logout(){
    API.logout();
    renderFormConnection();
    
}

const renderEditProfil = (user) => {
    //let isAdmin = user.Authorizations.readAccess === 2 && user.Authorizations.writeAccess === 2;
    updateHeader('Profil','logged');
    renderProfilForm(user);
    
    // let notChangedPasswordGuid = uuidv1();
    // console.log(notChangedPasswordGuid);
    // $('#editProfilForm').append(`
    //     <input name=Password type=hidden value=${notChangedPasswordGuid}/>
    //     <input name=matchedPassword type=hidden value=${notChangedPasswordGuid}/>
    // `);
    $('.cancel').after(`
        <div class="cancel">
        <hr>
            <button class="form-control btn-warning" idUser='${user.Id}' id="deleteAccountCmd">Effacer le compte</button>
        </div>
    `);
    $(".cancel").click(() => {
        updateHeader('Listes des photos','loggedAddPhoto');
        renderPhotoIndex();
    });
    $("#Password").on('input',function(event){
        console.log(event.currentTarget.value);
        if(event.currentTarget.value.trim()){
            console.log('ecriture');
            $('#matchedPassword').attr('Required','');
        }else{
            $('#matchedPassword').removeAttr('Required');
        }
    });

    $("#deleteAccountCmd").click(async function() {
        const id = $(this).attr('idUser');
        
        renderDeleteUser(id);

        // await API.unsubscribeAccount(id)
        
    });

    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser'); // trouver une facon de ne pas check email presentement utilisé par user
    // call back la soumission du formulaire
    $('#editProfilForm').off().on("submit", function (event) {
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission

        let profil = getFormData($('#editProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;

        showWaitingGif(); // afficher GIF d’attente
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // va voir createProfil
        modifyProfil(profil); // commander la création au service API
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    });
}




const renderFormConnection = (user = null, title = '') => {
    updateHeader("Connexion", 'login');
    $("#content").html(`
        <div class="content" style="text-align:center">
            <h3>${title}</h3>
            <form class="form" id="loginForm">
                <input type='email'
                name='Email'
                class="form-control"
                id="Email"
                required
                RequireMessage = 'Veuillez entrer votre courriel'
                InvalidMessage = 'Courriel invalide'
                placeholder="adresse de courriel"
                value='${user ? user.Email : ""}'>
                <span class='wrong-email' style='color:red'></span>
                <input type='password'
                name='Password'
                id="Password"
                placeholder='Mot de passe'
                class="form-control"
                required
                RequireMessage = 'Veuillez entrer votre mot de passe'>
                <span class='wrong-pass' style='color:red'></span>
                <input type='submit' name='submit' value="Entrer" class="form-control btn-primary">
            </form>
            <div class="form">
                <hr>
                <button class="form-control btn-info" id="createProfilCmd">Nouveau compte</button>
            </div>
        </div>
    
    `);

    handleloginEvents();

    $('#createProfilCmd').on("click", () => {
        $("#content").html(renderFormInscription());
        // $(".viewTitle").text('Inscription');
    });
}

function renderDeleteUser(id) {
    $('#content').html(`
        <div class="content" style="text-align:center">
            <h3>Supprimer le compte ? </h3>
            <div class="form">
                <hr>
                <button style='background-color:red' class="form-control " id="supprimer">Oui</button>
                <br>
                <button class="form-control btn-info" id="annulerSuppresion">Annuler</button>
            </div>
        </div>
    
    `);

    $("#supprimer").on('click', async() => {
       if( await API.unsubscribeAccount(id) ) {
        renderFormConnection(null);
       }
    });
}

const renderProfilForm = (user = null) => {
    if(user){
        console.log(user)
        if(user.Avatar.trim() == '' || user.Avatar == 'http://localhost:5000/assetsRepository/'){ // Bizzarement, un user sans image contient http://localhost:5000/assetsRepository/ dans son user.Avatar mais juste du cote front-end , car la table json contient pourtant bien du vide
            user.Avatar = 'images/no-avatar.png';
        }
    }
    $("#newPhotoCmd").hide(); // camouffler l’icone de commande d’ajout de photo
    $("#content").html(`
        <form class="form" id="editProfilForm" method=POST>
            ${user != null ? `<input type='hidden' name='Id' id='Id' value='${user.Id}'/>` : '' }

            <fieldset>
            <legend>Adresse ce courriel</legend>
            <input type="email"
            class="form-control Email"
            name="Email"
            id="Email"
            placeholder="Courriel"
            required
            RequireMessage = 'Veuillez entrer votre courriel'
            InvalidMessage = 'Courriel invalide'
            CustomErrorMessage ="Ce courriel est déjà utilisé"
            value='${user != null ? user.Email : ''}'/>
            <input class="form-control MatchedInput"
            type="text"
            matchedInputId="Email"
            name="matchedEmail"
            id="matchedEmail"
            placeholder="Vérification"
            required
            RequireMessage = 'Veuillez entrez de nouveau votre courriel'
            InvalidMessage="Les courriels ne correspondent pas"
            value='${user != null ? user.Email : ''}' />
            </fieldset>

            <fieldset>
            <legend>Mot de passe</legend>
            
            <input type="password"
            class="form-control"
            name="Password"
            id="Password"
            placeholder="Mot de passe"
            ${user == null ? 'required' : ''} 
            RequireMessage = 'Veuillez entrer un mot de passe'
            InvalidMessage = 'Mot de passe trop court'/>
            
            <input class="form-control MatchedInput"
            type="password"
            matchedInputId="Password"
            name="matchedPassword"
            id="matchedPassword"
            placeholder="Vérification" 
            ${user == null ? 'required' : ''}
            InvalidMessage="Ne correspond pas au mot de passe" />
            </fieldset>

            <fieldset>
            <legend>Nom</legend>
            <input type="text"
            class="form-control Alpha"
            name="Name"
            id="Name"
            placeholder="Nom"
            required
            RequireMessage = 'Veuillez entrer votre nom'
            InvalidMessage = 'Nom invalide'
            value='${user != null ? user.Name : ''}'/>
            </fieldset>
            <fieldset>
            <legend>Avatar</legend>
            <div class='imageUploader'
            newImage='true'
            controlId='Avatar'
            imageSrc='${user != null ? user.Avatar : 'images/no-avatar.png'}'
            waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
            <button type='submit' name='submit' id='saveUserCmd' class="form-control btn-primary">Enregistrer</button>
        </form>
        </div>
        <div class="cancel">
            <button class="form-control btn-secondary" id="abortCmd">Annuler</button>
        </div>`
    );
          
    initFormValidation();
    initImageUploaders();
}

const renderFormInscription = () => {
    noTimeout(); // ne pas limiter le temps d’inactivité
    //eraseContent(); On fait html a la place de append alors...? // effacer le conteneur #content
    updateHeader("Inscription", "createProfil"); // mettre à jour l’entête et menu

    renderProfilForm();
    console.log($('.form'));



    $(".cancel").click(() => {
        $("#header").html(updateHeader);
        $("#content").html(renderFormConnection(null));
    });

    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    // call back la soumission du formulaire
    $('.form').on("submit", function (event) {
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission

        console.log('create');

        // console.log($("#createProfilForm"));

        let profil = getFormData($('.form'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;

        showWaitingGif(); // afficher GIF d’attente
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // va voir createProfil
        createProfil(profil); // commander la création au service API
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    });

};

function blockUser () {
    $(".block").click (async function () {
        let idUser = $(this).attr('id');
        let userToBlock = null;
        
        
        let users = await API.GetAccounts();

        if(users) {

            for(const user of users['data']) {
                if(user.Id===idUser) {
                    user.Authorizations.readAccess = 0;
                    user.Authorizations.writeAccess = 0;
                    userToBlock = user;
                    break;
                }
            }

            if(userToBlock) {
                res = await API.modifyUserProfil(userToBlock);
                if(res) {
                    console.log('changed');
                }
            } 
        }

    });
}

async function renderUsersList(){
    updateHeader('Gestion des usagers', 'logged');
    let users = await API.GetAccounts();
    console.log(users['data']);
    let currentUser = await API.retrieveLoggedUser();
    let html = '';
    users['data'].forEach(user => {
        if(currentUser.Id != user.Id){
            let userType = `<i title=Usager class="fas fa-user-alt dodgerblueCmd"></i>`; // usager normal
            let userStatus = `<i title=Valide class="fa-regular fa-circle greenCmd block" id='${user.Id}'></i>`;
            let deleteUser = `<i title="Effacer l'usager" class="fas fa-user-slash goldenrodCmd"></i>`;
            
            if(user.Authorizations.readAccess === 2 && user.Authorizations.writeAccess === 2){ 
                userType = `<i title=Administrateur class="fas fa-user-cog dodgerblueCmd"></i>`; // admin
            }
            // if(user.blocked) comment on fait pour savoir user blocked?
            html += `<div class=UserRow> 
                    <div class=UserContainer>
                        <div class=UserLayout>
                            <div class=UserAvatarSmall style='background-image:url(${user.Avatar})'>
                            </div> 
                            <div class=UserInfo>
                                <div class=UserName>${user.Name}</div>
                                <div class=UserEmail>${user.Email}</div>
                            </div>
                        </div> 
                        <div class=UserCommandPanel userid=${user.Id}>
                            ${userType}
                            ${userStatus}
                            ${deleteUser}
                        </div>                     
                    </div>
                </div>`;
        }
        
    });
    $('#content').html(html);

    // mettre les listeners

    $('.fa-user-alt').click((event)=>{
        let userId = $(event.currentTarget).parent().attr('userid');
        console.log('alt',userId);
        grantAdminCommand(userId);
    })
    $('.fa-user-cog').click((event)=>{
        let userId = $(event.currentTarget).parent().attr('userid');
        console.log('cog',userId);
    });
    blockUser();

}



function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

async function grantAdminCommand(userId){
    let pass = await API.grantAdmin(userId);
    if(pass){
        renderUsersList();
    }
}

async function createProfil(profil) {

    profil = await API.register(profil); 
    if(profil) {
        console.log(profil)
        renderFormConnection(profil, `Veuillez prendre vos courriels pour récupérer votre code de vérification qui vous sera demandé lors de votre prochaine connexion.`);
        console.log(profil);
    } else {
        console.log(API.currentHttpError);
    }
    
}

// C'est ici continuer 
async function modifyProfil(updatedUser){ 
    
    let loggedUser = API.retrieveLoggedUser();

    loggedUser = await API.modifyUserProfil(updatedUser);
    
    if(loggedUser) {
        if(loggedUser.VerifyCode === 'unverified')
            renderFormAccountValidation(loggedUser);
        else
            renderPhotoIndex();
    } else {
        console.log(API.currentHttpError);
    }
}

function serverError() {
    console.log('server error');

    return `
        <div class="form">
            <b style='color:red; text-align:center;'>Le serveur ne répond pas</b>
            <hr>
            <button type='button' class="form-control btn-primary" id="tryAgain">Réessayer</button>
        </div>
    `;
}

function retry() {
    $("#tryAgain").click(() => {
        console.log('retry...');
        eraseContent();
        renderFormConnection(null);
    });
}

function handleLoginError(user, errorMsg) {
    eraseContent();
    renderFormConnection(user);

    if (errorMsg.includes("pass")) {
        $('.wrong-pass').text("Mot de passe incorret");
    } else if (errorMsg.includes("email")) {
        $('.wrong-email').text("Courriel introuvable");
    } else {
        $('.form').empty();
        $("#content").append(serverError());
        retry();
    }
}

function handleVerificationError(errorMsg){
    $('.wrong-code').text(errorMsg);
}

const handleloginEvents =  () => {
    
    $('form').off().submit(async (e) => {
        e.preventDefault();
        let user = getFormData($("#loginForm"));
        showWaitingGif();

        // Il faut verif si email confirmed
        const token = await API.login(user.Email, user.Password);

        if(token) {
            eraseContent();
            console.log(token);
            if(token.VerifyCode == 'unverified')
                renderFormAccountValidation(token);
            
            else
                renderPhotoIndex(); // si le user est verified on peut montrer les photos?...
        } else { 
            handleLoginError(user, API.currentHttpError);
            handleloginEvents(); 
        }
    });
}

const handleVerificationEvent = (user) => {
    $('form').off().submit(async (e) => {

        e.preventDefault();

        let code = $("#VerificationCode").val();
        showWaitingGif();
        const passed = await API.verifyEmail(user.Id, code);

        if(passed) {
            eraseContent();
            renderPhotoIndex();
        } else { 
            // retry..
            eraseContent();
            renderFormAccountValidation(user);
            handleVerificationError('le code est invalide.');
        }
    });
}

const renderFormAccountValidation = (user) => {
    // let message = edit ? `à votre nouvelle adresse` : `par courriel`;
    if(user.VerifyCode == 'unverified'){
        noTimeout(); // ne pas limiter le temps d’inactivité
        updateHeader("Vérification", "logged"); // mettre à jour l’entête et menu
        $('#content').html(`
        <form class="form" id="verifForm">
            <p><b>Veuillez entrer le code de vérification que vous avez reçu par courriel.</b><p>
            <input type='text'
            name='VerificationCode'
            class="form-control"
            id="VerificationCode"
            required
            RequireMessage = 'Veuillez entrer votre code de vérification'
            InvalidMessage = 'Code invalide'
            placeholder="Code de vérification de courriel">
            <span class='wrong-code' style='color:red'></span>
            <input type='submit' name='submit' value="Vérifier" class="form-control btn-primary">
        
        </form>`);

        initFormValidation();
        handleVerificationEvent(user);
        
        console.log('verifty form');

    }

}

const renderPhotoIndex = () => {
    updateHeader('Liste des photos','loggedAddPhoto');
    $('#content').html(`
        <p>Photos index... to do</p> `);
}

$(() => {
    // Il faut normalement render index mais pour linstant vu qu'on ne l'a pas on render form connection
    let user = API.retrieveLoggedUser();
    if(user) {
        renderPhotoIndex();
        renderFormAccountValidation(user); // s'affiche seulemnt si user n'a pas encore confirmé son code email
    } else {
        console.log("else");
        updateHeader('Connexion','login');
        renderFormConnection(null);
    }
})

