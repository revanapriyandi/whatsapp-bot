import { database } from "../../libs/whatsapp"
import type { Event } from "../../types/command"

import fetch from 'node-fetch';

export default <Event>{
    execute: async ({ client, message, command }) => {
        if (message.fromMe || command) return
        const db = await database.getAllUsers();

        async function getHolidays(year: number, countryCode: string) {
            const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
            const response = await fetch(url);
            const holidays = await response.json();
            return holidays;
        }

        const today = new Date();
        const year = today.getFullYear();

        getHolidays(year, 'ID').then(holidays => {
            // ambil hari ini
            const todayStr = today.toISOString().slice(0, 10);
            // cek apakah ada hari penting hari ini
            const todayHoliday = holidays.find(holiday => holiday.date === todayStr);
            if (todayHoliday) {
                // jika ada hari penting, tambahkan pesan ke pengingat
                const messages = `Hari ini adalah ${todayHoliday.name}! ${todayHoliday.name} dirayakan di ${todayHoliday.countries.join(', ')}.`;
                db.forEach(async (user) => {
                    client.sendMessage(user.userId, {
                        text: messages
                    });
                })
            } else {
                console.log('Tidak ada hari penting hari ini.');
            }
        });
    }
}