# PureCloud-Login

Extensión para navegadores basados en Chromium (Google Chrome, Brave, Opera, etc), que permite gestionar el acceso y logueo a los clientes de PureCloud

# Requisitos:
* Crear un archivo vacío en un repositorio de GitHub
* Generar un [access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) que tenga permiso de lectura y escritura sobre el archivo creado en el paso anterior


# ¿Cómo instalar la extensión?
* Descargar el repositorio y dejarlo descomprimido en una carpeta
* Editar el archivo que se encuentra en la carpeta "js > content-script.js" y remplazar la frase `aca-va-el-org-id` por el ID de la organización principal partner de Genesys
* En el navegador ir a la siguiente URL `chrome://extensions/`
* Habilitar la opción "Modo de desarrollador"
* Hacer click en el botón "Cargar extensión sin empaquetar"
* Seleccionar la carpeta donde se encuentra el repositorio descomprimido


# Configurar la extensión:
* En el campo "URL" poner la siguiente URL `https://api.github.com/repos/USUARIO/REPOSITORIO/contents/ARCHIVO` remplazado los valores USUARIO, REPOSITORIO y ARCHIVO según corresponda
* En "Token" poner el access token generado
* En la "Actual llave de desencriptado" hay que poner la palabra o frase que va a usarse para encriptar el archivo donde se almacenan los datos de los clientes
* Hacer click en el botón "Guardar"
  
Si es la primera vez que usa la herramienta o el archivo está vacío, una vez que coloque los datos tiene que ir al botón de "Repo" en la esquina superior derecha y hacer click en el botón "Cargar template vacio"

![FormatFactory Screen Record20230718_013318 00_00_00-00_00_30  640i ~2](https://github.com/lavoratonicolas/PureCloud-Login/assets/14341416/cce126f1-e6c4-4276-8782-6c5d4481af10)

Troubleshooting: Si luego de guardar estos cambios aparece el mensaje "No se pueden obtener los datos desde la nube", es porque la URL o el Token están mal o el token no tiene los permisos suficientes

# Añadir clientes:
Para añadir nuevos clientes hay que hacer uso del botón "Añadir" que tiene el símbolo de un más.

Hay dos formas de añadir un cliente, una es de forma "Directa" y la otra es "Mediante mi Org".

* Directa:
Se completan los campos con los datos correspondientes a la organización, tales como la región, nombre de la organización dentro de Genesys, meil y contraseña usados

* Mediante mi Org:
Cuando usamos la organización partner de Genesys como punto de conexión a otras organizaciones, hay que utilizar este método y configurar el ID de la organización final a la cual se quiere conectar y elegir cual va a ser la cuenta puente para establecer esta conexión (tiene que ser la cuenta partner de Genesys)

