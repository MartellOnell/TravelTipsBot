import TelegramBot, {Message} from "node-telegram-bot-api";
import {CronJob} from "cron";
import {CronOptions, jsonUser} from "./index.types";
import {User} from "./db/models.js";
import dataTips from './tipsData/data.json' assert {type: "json"}
import {sequelize} from "./db/db.js";

const token: string = "6316173967:AAGvymZyXZCEnkl4uuL7b4VKyQMUyV-8erE"
const bot: TelegramBot = new TelegramBot(token, {polling: true});

try {
    await sequelize.authenticate()
    await sequelize.sync()
} catch(e) {
    console.log(e)
}

bot.onText(/\/start/, async (msg: Message): Promise<void> => {
    const chatId: number | undefined = msg.chat.id
    let user: User | null = await User.findOne({where: {id: chatId}})
    if (user === null) {
        const newData: jsonUser = {
            id: chatId,
            counts: 0
        }
        user = await User.create(newData)
    }

    const handleSendTips = async (): Promise<void> => {
        if (user !== null) {
            user.counts = user.counts + 2
            await user.save()
            await bot.sendMessage(chatId, `hello, its daily tips:\n${dataTips[user.counts - 1].value}\n${dataTips[user.counts].value}`)
        } else {
            await bot.sendMessage(chatId, "something wrong, try later and type '/start'")
            job.stop()
        }
    }

    const cronOptions: CronOptions = {
        cronTime: '* * * * *',
        onTick: handleSendTips,
        start: true,
        timeZone: 'Asia/Yekaterinburg'
    }
    const job: CronJob = CronJob.from(cronOptions)
    console.log("job started")
})

bot.onText(/\/checkCounts/, async (msg: Message): Promise<void> => {
    const chatId: number = msg.chat.id
    const user: User | null = await User.findOne({
        where: {
            id: chatId
        }
    })
    if (user !== null) {
        const counts: number = user.counts
        await bot.sendMessage(chatId, `how many tips passed: ${counts}`)
    }
})

bot.onText(/\/getPassedTips (.)/, async (msg: Message, arg: RegExpMatchArray | null): Promise<void> => {
    const chatId: number = msg.chat.id
    const user: User | null = await User.findOne({
        where: {
            id: chatId
        }
    })
    if (user !== null) {
        console.log('user exists')
        const counts: number = user.counts
        if (arg?.input !== undefined && arg?.input !== null) {
            console.log("succ found argument")
            const msgArg: string | undefined = arg.input.split(" ")[1]
            if (msgArg !== undefined && !isNaN(Number(msgArg))) {
                console.log('argument is number (succ)')
                const argCounts: number = Number(msgArg)
                if (counts + 1 >= argCounts) {
                    console.log('successful send current tips')
                    await bot.sendMessage(chatId, `${msgArg}th tip: ${dataTips[argCounts - 1].value}`)
                } else {
                    console.log(counts)
                    console.log(argCounts)
                    console.log('that tips is not passed now')
                    await bot.sendMessage(chatId, `you did not pass this tip`)
                }
            } else {
                // do something if arg not a number
                console.log("argument is not a number")
                await bot.sendMessage(chatId, `argument is not a number`)
            }
        } else {
            // do something if arg does not exist
            console.log('argument does not exists')
            await bot.sendMessage(chatId, `this command requires argument (number of count)`)
        }
    } else {
        // do something if user does not exist or not found
        console.log('user does not exist!')
        await bot.sendMessage(chatId, `sorry, user not found (try typing "/start" again)`)
    }
})