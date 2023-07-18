const CSL_popup = "CSL_popup";
const CSL_URL = "CSL_URL";
const CSL_email = "CSL_email";
const CSL_password = "CSL_password";
const CSL_organization = "CSL_organization";
const CSL_organization_id = "CSL_organization_id";

const main_org = "aca-va-el-org-id";

document.body.style.display = "none";
document.body.style.pointerEvents = "none";
clear_old_login();

async function clear_old_login() {
    const popup = await chrome.storage.local.get(CSL_popup);

    if (popup.CSL_popup == 1) {
        document.body.style.filter = "blur(10px)";
        document.body.style.pointerEvents = "none";
        localStorage.clear();

        await chrome.storage.local.set({ [CSL_popup]: 2 });
        const url = await chrome.storage.local.get(CSL_URL);
        location.replace(url.CSL_URL + '/logout');

    } else if (popup.CSL_popup == 2) {
        const url = await chrome.storage.local.get(CSL_URL);
        await chrome.storage.local.set({ [CSL_popup]: 3 });
        location.replace(url.CSL_URL + '/logout');

    } else if (popup.CSL_popup == 3) {
        const url = await chrome.storage.local.get(CSL_URL);
        const email = await chrome.storage.local.get(CSL_email);
        const password = await chrome.storage.local.get(CSL_password);
        const organization = await chrome.storage.local.get(CSL_organization);
        const login_response = await login_token(url.CSL_URL + "/login", email.CSL_email, password.CSL_password, organization.CSL_organization);

        if (login_response.orgs.length >= 1) {
            await chrome.storage.local.set({ [CSL_popup]: 4 });
            if (login_response.orgs.length >= 2) {
                location.replace(url.CSL_URL.replace("login", "apps"));
            } else {
                clean_csl();
                location.replace(url.CSL_URL.replace("login", "apps"));
            }
        }
        else {
            clean_csl();
            alert("Se produjo un error inesperado");
            disable_body();
        }

    } else if (popup.CSL_popup == 4) {
        const rid = window.location.href.match(/\?rid=(.*?)#\//);
        if (rid != null) {
            const organization_id = await chrome.storage.local.get(CSL_organization_id);
            if (organization_id.CSL_organization_id != '') {
                await login_org(organization_id.CSL_organization_id, rid[1]);
            } else {
                await login_org(main_org, rid[1]);
            }
            await clean_csl();
            location.replace(window.location.href.replace("login", "apps"))
        }
    }
    else {
        disable_body();
    }
}

async function clean_csl() {
    await chrome.storage.local.set({ [CSL_popup]: 5 });
    await chrome.storage.local.remove(CSL_popup);
    await chrome.storage.local.remove(CSL_URL);
    await chrome.storage.local.remove(CSL_email);
    await chrome.storage.local.remove(CSL_password);
    await chrome.storage.local.remove(CSL_organization);
    await chrome.storage.local.remove(CSL_organization_id);
}

async function login_token(url, email, password, organization) {
    const body = '{"username":"' + email + '","password":"' + password + '","orgName":"' + organization + '","lang":"en"}';

    const response = await fetch(url, {
        method: "POST",
        cache: "no-cache",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: body
    })

    if (response.status != 200) {
        alert_error(response.status);
    }

    const content = await response.json();

    return content;
}

async function get_csrf() {
    const parser = new DOMParser();

    const response = await fetch("https://login.mypurecloud.com", {
        method: "GET",
        cache: "no-cache",
    })

    const doc = parser.parseFromString(await response.text(), "text/html");

    return doc.getElementsByName("csrf")[0].content;
}

async function login_org(org_id, rid) {
    const csrf = await get_csrf();

    fetch("https://login.mypurecloud.com/request/" + String(rid), {
        method: "PUT",
        cache: "no-cache",
        headers: {
            'inin-csrf-token': csrf
        },
        body: '{ "organizationId": "' + org_id + '" }'
    })
}

function alert_error(response_status) {
    clean_csl();
    if (response_status == 401) {
        alert("Datos ingresados incorrectos. Por favor revise los datos de login");
    } else if (response_status == 429) {
        alert("Demasiados intentos fallidos, espere 5 minutos para volver a intentar");
    } else if (response_status != 200) {
        alert("Error no contemplado: " + String(response_status));
    }
    disable_body();
}

function disable_body() {
    document.body.style.display = "";
    document.body.style.pointerEvents = "";
}