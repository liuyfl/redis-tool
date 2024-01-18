module.exports = {
    pluginOptions: {
      electronBuilder: {
        builderOptions: {
            productName:'redis-tool-app',
            "mac":{
              "icon":'./public/icon.icns'
            },
            "win":{
              "icon":'public/icon.ico'
            },
            extraResources:[
                {
                  from:'./connection.json',
                  to:'./connection.json'
                }
              ]
        }
      }
    }
  }