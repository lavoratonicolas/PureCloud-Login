var JSON_URL = '';
var JSON_AUTH = '';
var key = '';

const localstorage_key = "PureCloud_CustomersJson";
const cls_github_url = "cls_github_url"
const cls_github_token = "cls_github_token"
const cls_json_key = "cls_json_key";

const cls_menu = "cls_menu";
const cls_select_customer = "cls_select_customer";
const cls_fields = ["cls_field1", "cls_field2", "cls_field3", "cls_field4", "cls_field5", "cls_field6", "cls_field7", "cls_field8"];

let old_name = "";
let new_name = "";


const refresh_btn = document.getElementById("refresh-btn");
const edit_github_btn = document.getElementById("edit-github-btn");
const save_github_btn = document.getElementById("save-github-btn");
const cancel_github_btn = document.getElementById("cancel-github-btn");
const search_customer = document.getElementById("search-customer");
const form_add_btn = document.getElementById("form-add-customer-btn");
const form_edit_btn = document.getElementById("form-edit-customer-btn");
const connection_type_list = document.getElementById("connectiontypelist");
const cancel_btn = document.getElementById("cancel-btn");
const add_customer_btn = document.getElementById("add-customer-btn");
const edit_btn = document.getElementById("edit-customer-btn");
const delete_customer_btn = document.getElementById("delete-customer-btn");
const connect_customer_btn = document.getElementById("connect-customer-btn");
const select_customer = document.getElementById("select-customer");

const const_fname = document.getElementById("fname");
const const_forganizationid = document.getElementById("forganizationid");
const const_fbridge = document.getElementById("fbridge");
const const_fregion = document.getElementById("fregion");
const const_forganization = document.getElementById("forganization");
const const_femail = document.getElementById("femail");
const const_fpassword = document.getElementById("fpassword");

const const_furl = document.getElementById("furl");
const const_ftoken = document.getElementById("ftoken");
const const_fkey = document.getElementById("fkey");
const const_ltemplate = document.getElementById("ltemplate");


main();


function main() {

    chrome.storage.local.get([cls_github_url]).then((result) => {
        if (result.cls_github_url != undefined) {
            JSON_URL = result.cls_github_url

            chrome.storage.local.get([cls_github_token]).then((result) => {
                if (result.cls_github_token != undefined) {
                    JSON_AUTH = result.cls_github_token;

                    chrome.storage.local.get([cls_json_key]).then((result) => {
                        if (result.cls_json_key != undefined) {
                            key = result.cls_json_key;

                            Get_ClinetsJson().then(function (response) {
                                if (response[0] == null) {
                                    alert("No se pueden obtener los datos desde la nube");
                                } else {
                                    try {
                                        document.body.style.filter = "";
                                        document.body.style.pointerEvents = "";

                                        chrome.storage.local.get([cls_menu]).then((result) => {
                                            switch (result.cls_menu) {
                                                case "repo-form":
                                                    edit_github_btn.dispatchEvent(new Event("click"));
                                                    break;
                                                case "add-customer-form":
                                                    form_add_btn.dispatchEvent(new Event("click"));
                                                    break;
                                                case "edit-customer-form":
                                                    chrome.storage.local.get([cls_select_customer]).then((result) => {
                                                        document.getElementById("select-customer").value = result.cls_select_customer;
                                                        form_edit_btn.dispatchEvent(new Event("click"));
                                                    })
                                                    break;
                                                default:
                                                    break;
                                            }
                                        })

                                        const customers = JSON.parse(decrypt(sessionStorage.getItem(localstorage_key), key)).Customers;

                                        for (customer of customers) {
                                            const name = customer.name;
                                            const option = document.createElement("option");

                                            option.setAttribute("value", name);
                                            option.innerHTML = name;
                                            document.getElementById("select-customer").appendChild(option);
                                        }
                                    } catch (error) {
                                        console.log("Llave incorrecta");
                                    }
                                }
                            });
                            document.body.style.filter = "";
                            document.body.style.pointerEvents = "";

                        } else {
                            alert("Key para desencriptar los datos vacio")
                        }
                    });
                } else {
                    alert("Token del repositorio vacio")
                }
            });
        } else {

            document.body.style.filter = "";
            document.body.style.pointerEvents = "";
            edit_github_btn.dispatchEvent(new Event("click"));
        }
    });
}



function encrypt(text, key) {
    let ed_text = "";

    for (index in text) {
        ed_text += String.fromCharCode(text.charCodeAt(index) + key.charCodeAt(index % key.length));
    }

    return encodeURIComponent(ed_text);
}


function decrypt(text, key) {
    let ed_text = "";

    text = decodeURIComponent(text);
    for (index in text) {
        ed_text += String.fromCharCode(text.charCodeAt(index) - key.charCodeAt(index % key.length));
    }

    return ed_text;
}


async function Get_ClinetsJson() {
    const response = await fetch(JSON_URL, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Authorization": "Bearer " + JSON_AUTH
        }
    });

    const data = await response.json();
    let json = null;
    if (data.content != undefined) {
        json = atob(data.content);
        sessionStorage.setItem(localstorage_key, json);
    }

    return [json, data.sha];
}


async function Put_ClinetsJson(message, json, sha) {
    const body = '{"message":"' + message + '","content":"' + btoa(encrypt(JSON.stringify(json), key)) + '", "sha":"' + sha + '"}';

    const response = await fetch(JSON_URL, {
        method: "PUT",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + JSON_AUTH
        },
        body: body
    });

    return response.status;
}

const_ltemplate.addEventListener("click", function () {

    const response = confirm("Cargar el template borrará a todos los clientes de la lista ¿Desea continuar?");

    if (response == true) {
        Get_ClinetsJson().then(function (response) {
            if (response[0] == null) {
                alert("No se pudieron obtener datos de la nube");
            } else {
                const base_json = JSON.parse('{"Customers":[{"direct":"direct","name":"Cliente de ejemplo","organization_id":"","bridge":"","region":"Americas (US East)","organization":"Nombre de la organizacion","email":"Email","password":"Contraseña"}],"Regions_login_URLs":[{"region_name":"Americas (US East)","region_url":"https://login.mypurecloud.com"},{"region_name":"Americas (US East 2)","region_url":"https://login.use2.us-gov-pure.cloud"},{"region_name":"Americas (US West)","region_url":"https://login.usw2.pure.cloud"},{"region_name":"Americas (Canada)","region_url":"https://login.cac1.pure.cloud"},{"region_name":"Americas (São Paulo)","region_url":"https://login.sae1.pure.cloud"},{"region_name":"EMEA (Frankfurt)","region_url":"https://login.mypurecloud.de"},{"region_name":"EMEA (Dublin)","region_url":"https://login.mypurecloud.ie"},{"region_name":"EMEA (London)","region_url":"https://login.euw2.pure.cloud"},{"region_name":"Asia Pacific (Mumbai)","region_url":"https://login.aps1.pure.cloud"},{"region_name":"Asia Pacific (Seoul)","region_url":"https://login.apne2.pure.cloud"},{"region_name":"Asia Pacific (Sydney)","region_url":"https://login.mypurecloud.com.au"},{"region_name":"Asia Pacific (Tokyo)","region_url":"https://login.mypurecloud.jp"}]}');
                const message = "The template was load"

                Put_ClinetsJson(message, base_json, response[1]).then(function (put_response) {
                    if (put_response == 200) {
                        sessionStorage.removeItem(localstorage_key);
                        chrome.storage.local.set({ [cls_menu]: "" }).then(() => {
                            chrome.storage.local.remove(cls_fields);
                            location.href = 'popup.html';
                            alert("El template se cargo con exito");
                        });
                    } else {
                        alert("No se pudo realizar la operación");
                    }
                });
            }
        })
    }

});

function connect() {
    let selected_customer_name = document.getElementById("select-customer").value;
    let organization_id = null;
    const json = JSON.parse(decrypt(sessionStorage.getItem(localstorage_key), key));
    const CSL_popup = "CSL_popup";
    const CSL_URL = "CSL_URL";
    const CSL_email = "CSL_email";
    const CSL_password = "CSL_password";
    const CSL_organization = "CSL_organization";
    const CSL_organization_id = "CSL_organization_id";

    if (selected_customer_name != "") {
        for (customer of json.Customers) {
            if (customer.name === selected_customer_name && customer.direct == "byorg") {
                selected_customer_name = customer.bridge;
                organization_id = customer.organization_id;
                break;
            } else if (customer.name === selected_customer_name && customer.direct == "direct") {
                organization_id = customer.organization_id;
                break;
            }
        }

        for (customer of json.Customers) {
            if (customer.name === selected_customer_name) {
                for (region of json.Regions_login_URLs) {
                    if (customer.region == region.region_name) {
                        chrome.storage.local.set({ [CSL_popup]: 1 }).then(() => {
                            chrome.storage.local.set({ [CSL_URL]: region.region_url }).then(() => {
                                chrome.storage.local.set({ [CSL_email]: customer.email }).then(() => {
                                    chrome.storage.local.set({ [CSL_password]: customer.password }).then(() => {
                                        chrome.storage.local.set({ [CSL_organization]: customer.organization }).then(() => {
                                            chrome.storage.local.set({ [CSL_organization_id]: organization_id }).then(() => {
                                                region.region_url = region.region_url.replace("login", "apps");
                                                close_tabs(region.region_url);
                                                window.open(region.region_url);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                        break;
                    }
                }
                break;
            }
        }
    }
    else {
        alert("Seleccione un cliente para conectarse");
    }
};


function close_tabs(login_url) {
    chrome.windows.getAll({ populate: true }, function (windows) {
        for (index in windows) {
            for (tab of windows[index].tabs) {
                if (tab.url.includes(login_url) || tab.url.includes(region.region_url.replace("apps", "login"))) {
                    chrome.tabs.remove(tab.id);
                }
            }
        }
    });
}



refresh_btn.addEventListener("click", function () {
    location.href = 'popup.html';
});


edit_github_btn.addEventListener("click", function () {
    chrome.storage.local.set({ [cls_menu]: "repo-form" }).then(() => {
        const elements = document.body.getElementsByTagName("*");
        const divform = document.getElementById("div-github-form");
        const form = document.getElementById("form-github-connection");

        chrome.storage.local.get([cls_github_url]).then((result) => {
            if (result.cls_github_url != undefined) {
                form.furl.value = result.cls_github_url;
                cancel_github_btn.style.display = "";
                const_ltemplate.style.display = "";
            }
        });

        chrome.storage.local.get([cls_github_token]).then((result) => {
            if (result.cls_github_token != undefined) {
                form.ftoken.value = result.cls_github_token;
            }
        });

        chrome.storage.local.get([cls_json_key]).then((result) => {
            if (result.cls_json_key != undefined) {
                form.fkey.value = result.cls_json_key;
            }
        });

        chrome.storage.local.get([cls_fields[0]]).then((result) => {
            if (result[cls_fields[0]] != undefined) {
                form.furl.value = result[cls_fields[0]];
            }
        });

        chrome.storage.local.get([cls_fields[1]]).then((result) => {
            if (result[cls_fields[1]] != undefined) {
                form.ftoken.value = result[cls_fields[1]];
            }
        });

        chrome.storage.local.get([cls_fields[2]]).then((result) => {
            if (result[cls_fields[2]] != undefined) {
                form.fkey.value = result[cls_fields[2]];
            }
        });


        for (element of elements) {
            if (divform.contains(element) && element != cancel_github_btn && element != const_ltemplate) {
                element.style.display = "";
            } else {
                element.style.display = "none";
            }
        }
    });
});


const_fname.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[1]]: const_fname.value }).then(() => { });
});
const_forganizationid.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[2]]: const_forganizationid.value }).then(() => { });
});
const_fbridge.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[3]]: const_fbridge.value }).then(() => { });
});
const_fregion.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[4]]: const_fregion.value }).then(() => { });
});
const_forganization.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[5]]: const_forganization.value }).then(() => { });
});
const_femail.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[6]]: const_femail.value }).then(() => { });
});
const_fpassword.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[7]]: const_fpassword.value }).then(() => { });
});


const_furl.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[0]]: const_furl.value }).then(() => { });
});
const_ftoken.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[1]]: const_ftoken.value }).then(() => { });
});
const_fkey.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[2]]: const_fkey.value }).then(() => { });
});



save_github_btn.addEventListener("click", function () {

    const form = document.getElementById("form-github-connection");


    if (form.furl.value != '' && form.ftoken.value != '' && form.fkey.value != '') {
        chrome.storage.local.set({ [cls_github_url]: form.furl.value }).then(() => {
            chrome.storage.local.set({ [cls_github_token]: form.ftoken.value }).then(() => {
                chrome.storage.local.set({ [cls_json_key]: form.fkey.value }).then(() => {
                    chrome.storage.local.set({ [cls_menu]: "" }).then(() => {
                        chrome.storage.local.remove(cls_fields);
                        location.href = 'popup.html';
                    });

                });
            });
        });
    } else {
        alert("No puede haber campos vacios");
    }
});


cancel_github_btn.addEventListener("click", function () {
    chrome.storage.local.set({ [cls_menu]: "" }).then(() => {
        chrome.storage.local.remove(cls_fields);
        location.href = 'popup.html';
    });
});


search_customer.addEventListener("input", function () {
    const customers = document.getElementById("select-customer");

    for (customer of customers.childNodes) {
        if (customer.tagName == "OPTION") {
            if (customer.innerHTML.toUpperCase().indexOf(search_customer.value.toUpperCase()) != -1) {
                customer.style.display = "";
            }
            else {
                customer.style.display = "none";
            }
        }
    }
});


search_customer.addEventListener("keyup", function (event) {
    if (event.code == "Enter") {
        const customers = document.getElementById("select-customer");
        let aux = 0;
        document.getElementById("select-customer").value = '';

        for (customer of customers.childNodes) {
            if (customer.tagName == "OPTION" && customer.style.display != "none") {
                if (document.getElementById("select-customer").value == '') {
                    document.getElementById("select-customer").value = customer.value;
                }
                aux += 1;
            }
        }

        if (aux === 1) {
            connect();
        }
    }
});


connect_customer_btn.addEventListener("click", function () {
    connect();
});


select_customer.addEventListener("dblclick", function () {
    connect();
});


select_customer.addEventListener("keyup", function (event) {
    if (event.code == "Enter") {
        connect();
    }
});


function display_form(ignore) {
    const elements = document.body.getElementsByTagName("*");
    const divform = document.getElementById("div-form");
    const json = JSON.parse(decrypt(sessionStorage.getItem(localstorage_key), key));

    for (element of elements) {
        if (divform.contains(element) && element.id != ignore) {
            element.style.display = "";
        } else {
            element.style.display = "none";
        }
    }

    for (region of json.Regions_login_URLs) {
        const region_name = region.region_name;
        const option = document.createElement("option");

        option.setAttribute("value", region_name);
        option.innerHTML = region_name;
        document.getElementById("regionslist").appendChild(option);
    }

    for (customer of json.Customers) {
        if (customer.direct == "direct") {
            const customer_name = customer.name;
            const option = document.createElement("option");

            option.setAttribute("value", customer_name);
            option.innerHTML = customer_name;
            document.getElementById("bridgelist").appendChild(option);
        }
    }
}


function save_current_session() {
    chrome.storage.local.get([cls_fields[0]]).then((result) => {
        if (result[cls_fields[0]] != undefined) {
            connection_type_list.value = result[cls_fields[0]];
            connection_type_list.dispatchEvent(new Event("change"));
        }
    });

    chrome.storage.local.get([cls_fields[1]]).then((result) => {
        if (result[cls_fields[1]] != undefined) {
            const_fname.value = result[cls_fields[1]];
        }
    });

    chrome.storage.local.get([cls_fields[2]]).then((result) => {
        if (result[cls_fields[2]] != undefined) {
            const_forganizationid.value = result[cls_fields[2]];
        }
    });

    chrome.storage.local.get([cls_fields[3]]).then((result) => {
        if (result[cls_fields[3]] != undefined) {
            const_fbridge.value = result[cls_fields[3]];
        }
    });

    chrome.storage.local.get([cls_fields[4]]).then((result) => {
        if (result[cls_fields[4]] != undefined) {
            const_fregion.value = result[cls_fields[4]];
        }
    });

    chrome.storage.local.get([cls_fields[5]]).then((result) => {
        if (result[cls_fields[5]] != undefined) {
            const_forganization.value = result[cls_fields[5]];
        }
    });

    chrome.storage.local.get([cls_fields[6]]).then((result) => {
        if (result[cls_fields[6]] != undefined) {
            const_femail.value = result[cls_fields[6]];
        }
    });

    chrome.storage.local.get([cls_fields[7]]).then((result) => {
        if (result[cls_fields[7]] != undefined) {
            const_fpassword.value = result[cls_fields[7]];
        }
    });
}


form_add_btn.addEventListener("click", function () {
    chrome.storage.local.set({ [cls_menu]: "add-customer-form" }).then(() => {
        display_form("edit-customer-btn");
        save_current_session();
    });
});


form_edit_btn.addEventListener("click", function () {
    chrome.storage.local.set({ [cls_menu]: "edit-customer-form" }).then(() => {
        const selected_customer = document.getElementById("select-customer").value;

        if (selected_customer != '') {
            chrome.storage.local.set({ [cls_select_customer]: selected_customer }).then(() => {
                const json = JSON.parse(decrypt(sessionStorage.getItem(localstorage_key), key));
                const form = document.getElementById("form-add-customer");

                display_form("add-customer-btn");

                for (customer of json.Customers) {
                    if (customer.name == selected_customer) {
                        if (customer.direct == "byorg") {
                            for (element of form) {
                                if (element.id == "connectiontypelist" || element.id == "fname" || element.id == "forganizationid" || element.id == "fbridge") {
                                    element.removeAttribute("disabled");
                                } else {
                                    element.setAttribute("disabled", true);
                                }
                            }
                        }

                        form.connectiontypelist.value = customer.direct;
                        old_name = customer.name;
                        form.fname.value = customer.name;
                        form.forganizationid.value = customer.organization_id;
                        form.fbridge.value = customer.bridge;
                        form.fregion.value = customer.region;
                        form.forganization.value = customer.organization;
                        form.femail.value = customer.email;
                        form.fpassword.value = customer.password;

                        break;
                    }
                }
                save_current_session();
            });
        } else {
            alert("Debe seleccionar un cliente para editar");
        }
    });
});


connection_type_list.addEventListener("change", function () {
    chrome.storage.local.set({ [cls_fields[0]]: connection_type_list.value }).then(() => {
        const form = document.getElementById("form-add-customer");

        if (connection_type_list.value == "direct") {
            for (element of form) {
                if (element.id == "fbridge" || element.id == "forganizationid") {
                    element.setAttribute("disabled", true);
                } else {
                    element.removeAttribute("disabled");
                }
            }
        } else if (connection_type_list.value == "byorg") {
            for (element of form) {
                if (element.id == "connectiontypelist" || element.id == "fname" || element.id == "forganizationid" || element.id == "fbridge") {
                    element.removeAttribute("disabled");
                } else {
                    element.setAttribute("disabled", true);
                }
            }
        }
    });
});


cancel_btn.addEventListener("click", function () {
    chrome.storage.local.set({ [cls_menu]: "" }).then(() => {
        chrome.storage.local.remove(cls_fields);
        location.href = 'popup.html';
    });
});


function compilate_form_data() {
    let json = null;
    const form = document.getElementById("form-add-customer");
    const regioninput = document.getElementById("regionslist").querySelector('[value="' + form.fregion.value + '"]');
    const bridgeinput = document.getElementById("bridgelist").querySelector('[value="' + form.fbridge.value + '"]');

    if ((form.connectiontypelist.value == "direct" && (form.fname.value == "" || form.fregion.value == "" || form.forganization.value == "" || form.femail.value == "" || form.fpassword.value == "")) || (form.connectiontypelist.value == "byorg" && (form.fname.value == "" || form.forganizationid.value == "" || form.fbridge.value == ""))) {
        alert("No puede haber campos vacios");
    } else if ((form.connectiontypelist.value == "direct" && regioninput == null) || (form.connectiontypelist.value == "byorg" && bridgeinput == null)) {
        if (form.connectiontypelist.value == "direct") {
            alert("Se debe elegir una región de la lista");
        } else if (form.connectiontypelist.value == "byorg") {
            alert("Se debe elegir una cuenta de la lista");
        } else {
            alert("Error no contemplado");
        }
    } else {
        if (form.connectiontypelist.value == "direct") {
            json = ({
                "direct": form.connectiontypelist.value.trim(),
                "name": form.fname.value.trim(),
                "organization_id": "",
                "bridge": "",
                "region": form.fregion.value.trim(),
                "organization": form.forganization.value.trim(),
                "email": form.femail.value.trim(),
                "password": form.fpassword.value.trim()
            });
        } else if (form.connectiontypelist.value == "byorg") {
            json = ({
                "direct": form.connectiontypelist.value.trim(),
                "name": form.fname.value.trim(),
                "organization_id": form.forganizationid.value.trim(),
                "bridge": form.fbridge.value.trim(),
                "region": "",
                "organization": "",
                "email": "",
                "password": ""
            });
        } else {
            alert("Error no contemplado");
        }
    }

    return json;
}


function repeat_customer(update, new_customerJSON) {
    Get_ClinetsJson().then(function (response) {
        if (response[0] == null) {
            alert("No se pudieron obtener datos de la nube");
        } else {
            const dataJSON = JSON.parse(decrypt(sessionStorage.getItem(localstorage_key), key));
            let repeat_customer = 0;
            let aux_index = 0;

            if (update == 1) {
                for (index in dataJSON.Customers) {
                    if (dataJSON.Customers[index].name == old_name) {
                        delete dataJSON.Customers[index]
                        aux_index = index;
                        break;
                    }
                }
            }

            for (customer of dataJSON.Customers) {
                if (customer != undefined && new_customerJSON.name == customer.name) {
                    repeat_customer = repeat_customer + 1;
                }
            }

            if (repeat_customer === 0) {
                let message = "";
                if (update == 1) {
                    const form = document.getElementById("form-add-customer");

                    if (form.connectiontypelist.value == 'direct') {
                        for (customer of dataJSON.Customers) {
                            if (customer != undefined && customer.bridge == old_name) {
                                customer.bridge = form.fname.value;
                            }
                        }
                    }

                    message = "The customer " + new_customerJSON.name + " was modified";
                    dataJSON.Customers[aux_index] = new_customerJSON;
                } else {

                    message = "The customer " + new_customerJSON.name + " was added";
                    dataJSON.Customers.push(new_customerJSON);
                }

                Put_ClinetsJson(message, dataJSON, response[1]).then(function (put_response) {
                    if (put_response == 200) {
                        sessionStorage.removeItem(localstorage_key);
                        chrome.storage.local.set({ [cls_menu]: "" }).then(() => {
                            chrome.storage.local.remove(cls_fields);
                            location.href = 'popup.html';
                            if (update == 1) {
                                alert("Cliente actualizado con exito");
                            } else {
                                alert("Cliente agregado con exito");
                            }
                        });
                    } else {
                        alert("No se pudo realizar la operación");
                    }
                });
            }
            else {
                alert("Ya existe un cliente con ese nombre");
            }
        }
    })
}


add_customer_btn.addEventListener("click", function () {
    const new_customerJSON = compilate_form_data();

    if (new_customerJSON != null) {
        repeat_customer(0, new_customerJSON)
    }
});


edit_btn.addEventListener("click", function () {
    const new_customerJSON = compilate_form_data();

    if (new_customerJSON != null) {
        repeat_customer(1, new_customerJSON)
    }
});


delete_customer_btn.addEventListener("click", function () {
    const selected_customer = document.getElementById("select-customer").value;

    if (selected_customer != '') {
        const response = confirm("Desea eliminar el cliente? Una vez hecho se borrara para todos los usuarios");

        if (response == true) {
            Get_ClinetsJson().then(function (response) {
                if (response[0] == null) {
                    alert("No se pueden obtener los datos desde la nube");
                } else {
                    const dataJSON = JSON.parse(decrypt(sessionStorage.getItem(localstorage_key), key));
                    let name = "";

                    for (index in dataJSON.Customers) {
                        if (dataJSON.Customers[index].name == selected_customer) {
                            name = dataJSON.Customers[index].name;
                            dataJSON.Customers.splice(index, 1);
                            break;
                        }
                    }

                    const message = "The customer '" + name + "' was deleted";


                    Put_ClinetsJson(message, dataJSON, response[1]).then(function (put_response) {
                        if (put_response == 200) {
                            sessionStorage.removeItem(localstorage_key);
                            alert("Cliente removido con exito");
                            location.href = 'popup.html';
                        } else {
                            alert("No se pudo realizar la operación");
                        }
                    });
                }
            });
        }
    } else {
        alert("Debe elegir un cliente para eliminar");
    }
});
