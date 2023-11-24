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
            user.counts++
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