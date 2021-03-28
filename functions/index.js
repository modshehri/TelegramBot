const functions = require('firebase-functions');

const { Telegraf } = require('telegraf')
const fs = require('fs');

const bot = new Telegraf("1524672304:AAGrFCVPWhYycjq_KA9YYfuvbltVZ7vj4qg")

let orderNumber

bot.start((ctx) => {
    ctx.reply('Welcome dear '+ ctx.from.first_name +", we wish you are having a good day.\nProvide us with your shipment number please..")
    
    bot.on('message', (ctx) => {
        let rawdata = fs.readFileSync('../orders.json');
        let orders = JSON.parse(rawdata);
        orders = orders.orders
        msg = ctx.message.text
        
        if (!msg.match(/^[0-9]*$/)){
            ctx.reply("Invalid shipment number, please write the shipment number only..")
        }else {
            orderNumber = parseInt(msg)
            if (orderNumber > 4 || orderNumber < 0){
                ctx.reply("Invalid shipment number, please double check and re-write the shipment number..")
            }else {
                msg = "Your order number is "+orderNumber+", its price is "+orders[orderNumber].price+" and its status is "+orders[orderNumber].status
                ctx.telegram.sendMessage(ctx.chat.id, msg, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: "Yes",callback_data:"correctOrderNumber"}, {text: "No",callback_data:"wrongOrderNumber"}]
                        ]
                    }
                })
            }
            
        }

    })


})

bot.action('wrongOrderNumber', (ctx) => {
    ctx.deleteMessage
    ctx.reply("please double check and re-write the shipment number..")
})

bot.action('correctOrderNumber', (ctx) => {
    ctx.deleteMessage
    ctx.telegram.sendMessage(ctx.chat.id, "What is the shipmant status", {
        reply_markup: {
            inline_keyboard: [
                [{text: "good",callback_data:"goodShipment"}, {text: "damaged",callback_data:"damagedShipment"}]
            ]
        }
    })
})

bot.action('damagedShipment', (ctx) => {
    ctx.deleteMessage
    ctx.reply("Sorry for that!! The issue have been reported and your monay will return to you\nTake a picture of the damage please..")
    bot.on('photo', (ctx) => ctx.reply("Thank you for that and we will reply to you soon"))
})

bot.action('goodShipment', (ctx) => {
    ctx.deleteMessage
    ctx.telegram.sendMessage(ctx.chat.id, "Was the location accurate enough?", {
        reply_markup: {
            inline_keyboard: [
                [{text: "Yes",callback_data:"accurateLocation"}, {text: "No",callback_data:"unaccurateLocation"}]
            ]
        }
    })
})

bot.action('unaccurateLocation', (ctx) => {
    ctx.deleteMessage
    ctx.reply("Sorry for that!! provide us with your location again please..")
    bot.on('location', (ctx) => ctx.reply("Thank you for that"))
})

bot.action('accurateLocation', (ctx) => {
    ctx.deleteMessage
    ctx.reply("Thank you for your valuable information")
})




bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

exports.helloWorld = functions.https.onRequest((request, response) => {
   functions.logger.info("Hello logs!", {structuredData: true});
   response.send("Hello from Firebase!");
 });
