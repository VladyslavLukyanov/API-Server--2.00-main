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
                <div class="dropdown-item menuItemLayout" userId='${loggedUser.Id}' id="signOutCmd">
                    <i class="menuIcon fa fa-sign-out"></i> Deconnexion
                </div>
                <div class="dropdown-item menuItemLayout" id="editProfilCmd2">
                    <i class="menuIcon fas fa-edit"></i> Modifiez votre profil
                </div>

                ${isAdmin ?
            `<hr>
                    <div class="dropdown-item menuItemLayout" id="aboutCmd">
                        <i class="menuIcon fas fa-user-cog"></i> Gestion des usagers
                    </div>`
            : ""
        }
                
            </div>
        </div>
    `);

    // on profil photo click
    $('#editProfilCmd, #editProfilCmd2').click(() => {
        renderEditProfil(API.retrieveLoggedUser());
    });

    $('#signOutCmd').click(async (e) => {
        showWaitingGif();
        if (await API.logout()) {
            console.log('deconnexion reussie');
            renderFormConnection(null);
        }
    });

}

function connectedUserEvents() {
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


const renderEditProfil = (user) => {
    //let isAdmin = user.Authorizations.readAccess === 2 && user.Authorizations.writeAccess === 2;
    updateHeader('Profil','logged');
    renderProfilForm(user);
    
    $('.cancel').after(`
        <div class="cancel">
        <hr>
            <button class="form-control btn-warning" id="deleteAccountCmd">Effacer le compte</button>
        </div>
    `);
    $(".cancel").click(() => {
        updateHeader('Listes des photos','loggedAddPhoto');
        renderPhotoIndex();
    });

    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser'); // trouver une facon de ne pas check email presentement utilisé par user
    // call back la soumission du formulaire
    $('#editProfilForm').on("submit", function (event) {
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission

        let profil = getFormData($('#createProfilForm'));
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
    // $(".viewTitle").text('Connexion');
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

const renderProfilForm = (user = null) => {

    $("#newPhotoCmd").hide(); // camouffler l’icone de commande d’ajout de photo
    $("#content").html(`
        <form class="form" id="editProfilForm" method=POST>
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
            value='${user.Email}'/>
            <input class="form-control MatchedInput"
            type="text"
            matchedInputId="Email"
            name="matchedEmail"
            id="matchedEmail"
            placeholder="Vérification"
            required
            RequireMessage = 'Veuillez entrez de nouveau votre courriel'
            InvalidMessage="Les courriels ne correspondent pas"
            value='${user.Email}' />
            </fieldset>

            <fieldset>
            <legend>Mot de passe</legend>
            <input type="password"
            class="form-control"
            name="Password"
            id="Password"
            placeholder="Mot de passe"
            required
            RequireMessage = 'Veuillez entrer un mot de passe'
            InvalidMessage = 'Mot de passe trop court'/>
            <input class="form-control MatchedInput"
            type="password"
            matchedInputId="Password"
            name="matchedPassword"
            id="matchedPassword"
            placeholder="Vérification" required
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
            value='${user.Name}'/>
            </fieldset>
            <fieldset>
            <legend>Avatar</legend>
            <div class='imageUploader'
            newImage='true'
            controlId='Avatar'
            imageSrc='${user.Avatar != null ? user.Avatar : 'images/no-avatar.png'}'
            waitingImage="images/Loading_icon.gif">
            </div>
            </fieldset>
            <input type='submit' name='submit' id='saveUserCmd' value="Enregistrer" class="form-control btn-primary">
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
    $(".cancel").click(() => {
        $("#header").html(updateHeader);
        $("#content").html(renderFormConnection(null));
    });

    addConflictValidation(API.checkConflictURL(), 'Email', 'saveUser');
    // call back la soumission du formulaire
    $('#createProfilForm').on("submit", function (event) {
        event.preventDefault();// empêcher le fureteur de soumettre une requête de soumission

        let profil = getFormData($('#createProfilForm'));
        delete profil.matchedPassword;
        delete profil.matchedEmail;

        showWaitingGif(); // afficher GIF d’attente
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        // va voir createProfil
        createProfil(profil, event); // commander la création au service API
        // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    });

};

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

async function createProfil(profil) {

    profil = await API.register(profil);

    if (profil) {
        renderFormConnection(profil, `${profil.Name}, Votre compte a été créé.`);
        console.log(profil);
    } else {
        console.log(API.currentHttpError);
    }
    // Pourquoi on se fait rafraichir la page quand on s'inscrit pourtant on le event.preventDefault est appeler en haut?
    // renderFromConnection(`Votre compte a été créé.`) 
    // Veuillez prendre vos courriels pour réccupérer votre code de vérification qui vous sera demandé lors de votre prochaine connexion.`);
}

// C'est ici continuer 
async function modifyProfil(profil){
    profil = await API.modifyUserProfil(profil);
    
    if(profil){
        console.log('Profil edited');
    }else{
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

const handleloginEvents = () => {

    $('form').off().submit(async (e) => {
        e.preventDefault();
        let user = getFormData($("#loginForm"));
        showWaitingGif();
        const token = await API.login(user.Email, user.Password);

        if (token) {
            eraseContent();
            $("#content").append(token.Id);
            updateHeader('Liste des photos','logged');
            connectedUserEvents();
        } else {
            handleLoginError(user, API.currentHttpError);
            handleloginEvents();
        }
    });
}

const renderPhotoIndex = () => {
    updateHeader('Liste des photos','loggedAddPhoto');
    $('#content').html(`
        <p>Photos index... to do</p>
    
    `);
}

$(() => {
    if (!API.retrieveLoggedUser()) { // pas connecté
        renderFormConnection();
    } else {
        updateHeader('Liste des photos','loggedAddPhoto');
        //connectedUserEvents(); j'ai mis les events directement dans headerLogged, pour eviter de les perdres quand on change de type header 

    }
})

