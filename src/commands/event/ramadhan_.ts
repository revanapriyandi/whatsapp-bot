import { database } from "../../libs/whatsapp"
import type { Event } from "../../types/command"
import config from "../../utils/config"

import fetch from 'node-fetch';
import moment from 'moment-timezone';

export default <Event>{
    execute: async ({ client, message, command }) => {
        if (message.fromMe || message.isGroupMsg || command) return
        const db = await database.getAllUsers();
        db.forEach(async (user) => {
            const latitude = -6.1754;
            const longitude = 106.8272;
            const timezone = "Asia/Jakarta";

            const id = user.userId;
            const today = moment().tz(timezone).format('DD-MM-YYYY');
            const apiUrl = `http://api.aladhan.com/v1/timingsByAddress/${today}?address=Jakarta`;
            fetch(apiUrl)
                .then(response => response.json())
                .then(data => {
                    const timings = data.data.timings;

                    const imsak = moment(timings.Imsak, 'HH:mm').tz(timezone);
                    const subuh = moment(timings.Fajr, 'HH:mm').tz(timezone);
                    const maghrib = moment(timings.Maghrib, 'HH:mm').tz(timezone);
                    const isya = moment(timings.Isha, 'HH:mm').tz(timezone);

                    const sahurReminderTime = moment().tz(timezone).add(6, 'hours');
                    const imsakReminderTime = imsak.clone().subtract(50, 'minutes');
                    const iftarReminderTime = moment().tz(timezone).add(18, 'hours');

                    if (moment().tz(timezone).isBefore(subuh)) {
                        setTimeout(async () => {
                            const semangat = [
                                "Bersiaplah untuk menikmati sahur dengan penuh semangat! 🌅👊",
                                "Bangunlah dengan hati yang penuh syukur dan semangat yang tinggi! 🤲💪",
                                "Sahur adalah sumber kekuatanmu selama menjalani puasa. Bangun dan nikmati sahurmu dengan bahagia! 🍴😋",
                                "Puasa bukanlah menghindari makanan, tapi menghindari godaan. Nikmati sahurmu dan jalani puasamu dengan semangat yang tinggi! 🙏🌟",
                                "Bangunlah sebelum waktu sahur berlalu, agar kamu bisa mempersiapkan diri dengan baik dan menjalani ibadah puasa dengan sempurna! 🌅👀",
                                "Jangan khawatir, ada banyak pahala di balik setiap suap sahur yang kamu makan. Ayo, bangun dan nikmati sahurmu! 🤲🍽️",
                                "Sahur yang cukup adalah kunci untuk menjalani puasa dengan baik. Ayo, bangun dan persiapkan diri untuk berpuasa dengan semangat! 🌅💪",
                                "Sahur bisa membuatmu kenyang, tetapi imanmu yang akan terus memberimu kekuatan selama menjalani puasa. Bangun dan bersemangatlah! 🙏💪",
                                "Bangunlah sebelum fajar menyingsing, nikmati sahur dengan penuh syukur, dan jalani puasa dengan semangat yang tinggi! 🌅🤲",
                                "Sahur yang cukup bisa memberimu kekuatan untuk menjalani aktivitasmu sepanjang hari. Ayo, bangun dan nikmati sahurmu dengan semangat! 💪🍲"
                            ];

                            const randomIndex = Math.floor(Math.random() * semangat.length);
                            const randomData = semangat[randomIndex];
                            return await client.sendMessage(
                                id,
                                {
                                    image: { url: 'https://www.rukita.co/stories/wp-content/uploads/2022/04/foto-kucing-oren.jpg' },
                                    caption: `${randomData}\n\nSudah waktunya sahur! Waktunya ${timings.fajr}\n\n\n Mungkin terjadi ketidaksesuaian waktu, anda dapat mengatur timezone dan address anda dengan perintah */settimezone* dan */setaddress*`,
                                    footer: config.footer
                                }
                            )
                        }, sahurReminderTime.diff(moment().tz(timezone)));
                    } else if (moment().tz(timezone).isBetween(subuh, imsak)) {
                        setTimeout(async () => {
                            const kalimatImsak = [
                                "Jangan tidur terlalu nyenyak, saatnya untuk bangun imsak dan menjalankan ibadah puasa! 🌙🤲",
                                "Buka mata dan hati, persiapkan dirimu untuk bangun imsak dan menjalani ibadah puasa dengan semangat! 🌅🤲",
                                "Jangan sampai ketinggalan waktu imsak, bangunlah sekarang dan bersiaplah untuk menjalankan ibadah puasa dengan semangat! 🌙💪",
                                "Saatnya untuk menahan diri dari makan dan minum, jangan lupa untuk bangun imsak dan bersiaplah untuk menjalankan ibadah puasa! 🤲🌙",
                                "Bangunlah sebelum waktu imsak tiba, bersiaplah untuk menjalankan ibadah puasa dengan hati yang bersih dan semangat yang tinggi! 🌅🤲",
                                "Saatnya untuk menjalankan ibadah puasa dengan penuh kesadaran, bangun imsak dan bersiaplah untuk menahan diri dari makan dan minum! 🌙🙏",
                                "Jangan lewatkan kesempatan untuk meraih pahala di bulan Ramadan ini, bangun imsak dan nikmati indahnya bulan suci! 🌙🌟",
                                "Bangunlah sebelum waktu imsak tiba, persiapkan dirimu dengan baik dan bersiaplah untuk menjalankan ibadah puasa dengan penuh semangat! 🌅💪",
                                "Saatnya untuk menahan nafsu dan memperkuat iman, jangan lupa untuk bangun imsak dan bersiaplah untuk menjalankan ibadah puasa! 🌙🤲",
                                "Jangan sia-siakan kesempatan untuk meraih pahala di bulan Ramadan ini, bangunlah imsak dan persiapkan dirimu untuk menjalankan ibadah puasa dengan baik! 🌙🌟"
                            ];
                            const randomIndex = Math.floor(Math.random() * kalimatImsak.length);
                            const randomData = kalimatImsak[randomIndex];
                            return await client.sendMessage(
                                id,
                                {
                                    image: { url: 'https://3.bp.blogspot.com/-AwzbhO6WDb4/V1nQ7d_DjcI/AAAAAAAAJbE/W27xY3H4oK0DVeS9M-OvmPNjo6qvkbyoACLcB/s1600/habis-sahur-terbitlah-tidur.jpg' },
                                    caption: `${randomData}\n\nSudah waktunya imsak! Waktunya ${timings.imsak}\n\n\n Mungkin terjadi ketidaksesuaian waktu, anda dapat mengatur timezone dan address anda dengan perintah */settimezone* dan */setaddress*`,
                                    footer: `${config.footer}`
                                }
                            )
                        }, imsakReminderTime.diff(moment().tz(timezone)));
                    } else if (moment().tz(timezone).isBetween(imsak, maghrib)) {
                        setTimeout(async () => {
                            const kalimatBerbuka = [
                                "Buka puasa dengan hati yang bersih dan senyuman yang tulus! 😊🍴🍽️",
                                "Buka puasa dengan penuh syukur dan kebahagiaan! 🙏🌙🍴",
                                "Selamat berbuka puasa, semoga hidangan yang disajikan bisa membangkitkan semangatmu! 🍽️💪🌙",
                                "Buka puasa dengan menikmati hidangan yang lezat dan bersyukur atas segala nikmat yang diberikan! 🍴🍽️🙏",
                                "Buka puasa dengan membuka hati dan memaafkan segala kesalahan orang lain! 💖🍴🌙",
                                "Selamat menikmati hidangan berbuka puasa dengan keluarga tercinta! 🍽️🌙👨‍👩‍👧‍👦",
                                "Buka puasa dengan kebahagiaan dan rasa syukur yang mendalam! 🙏🍽️💕",
                                "Nikmati hidangan berbuka puasa dengan semangat dan penuh syukur! 🍴🌙💪",
                                "Jangan lupa untuk berbuka dengan santap yang seimbang dan menghidupkan semangat beribadahmu! 🍽️💖🌙",
                                "Selamat menikmati hidangan yang spesial untuk berbuka puasa! 🍴🌙👌"
                            ];
                            const randomIndex = Math.floor(Math.random() * kalimatBerbuka.length);
                            const randomData = kalimatBerbuka[randomIndex];
                            return await client.sendMessage(
                                id,
                                {
                                    image: { url: 'https://cdn-2.tstatic.net/jabar/foto/bank/images/ide-ucapan-selamat-berbuka-puasa.jpg' },
                                    caption: `${randomData}\n\nSudah waktunya berbuka! Waktunya ${timings.maghrib}\n\n\n Mungkin terjadi ketidaksesuaian waktu, anda dapat mengatur timezone dan address anda dengan perintah */settimezone* dan */setaddress*`,
                                    footer: `${config.footer}`
                                }
                            )
                        }, iftarReminderTime.diff(moment().tz(timezone)));
                    } else if (moment().tz(timezone).isBetween(maghrib, isya)) {
                        setTimeout(() => {
                            const kal = [
                                "Yuk, ayo ke masjid untuk solat Isya dan tarawih berjamaah! 🕌🙏🌙",
                                "Jangan lewatkan kesempatan untuk memperbanyak ibadah di bulan suci ini.Mari solat Isya dan tarawih berjamaah! 🌙🙏🕌",
                                "Solat Isya dan tarawih berjamaah di masjid membawa banyak manfaat untuk diri kita. Yuk, segera pergi ke masjid! 🙏🌙🕌",
                                "Raih keberkahan di bulan suci ini dengan memperbanyak ibadah. Solat Isya dan tarawih berjamaah di masjid adalah salah satu cara terbaiknya. 🌙🙏🕌",
                                "Setiap rakaat solat Isya dan tarawih yang kita kerjakan adalah doa bagi kebaikan kita. Yuk, jangan lewatkan kesempatan ini! 🕌🙏🌙",
                                "Mari kita tingkatkan ibadah kita dengan solat Isya dan tarawih berjamaah di masjid. Ayo, semangat! 💪🌙🙏",
                                "Ingat, setiap langkah kita menuju masjid untuk solat Isya dan tarawih akan dihitung sebagai ibadah. Yuk, ayo ke masjid! 🌙🙏🕌"
                            ]
                            const randomIndex = Math.floor(Math.random() * kal.length);
                            const randomData = kal[randomIndex];
                            console.log(`${randomData}\n\nSudah waktunya salat! Waktunya ${timings.isha}\n\n\n Mungkin terjadi ketidaksesuaian waktu, anda dapat mengatur timezone dan address anda dengan perintah */settimezone* dan */setaddress*`);
                        }, iftarReminderTime.diff(moment().tz(timezone)));
                    } else {
                        console.log('Waktu pengingat sudah lewat.');
                    }
                })
                .catch(error => {
                    console.error(error);
                });
        })

    }
}
