# QMOV2

#variable para URL default de meteor
export ROOT_URL="http://192.168.0.100:3000/"

#variable para SMTP meteor
export MAIL_URL="smtp://XXXXXXX@gmail.com:YYYYYYYY@smtp.gmail.com:465"

#Comando para generación de cliente
meteor-client bundle --url http://192.168.0.100:3000 -c meteor-client.config.json

