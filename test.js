import fetch from 'node-fetch';
import { getBonusArriveRedirectUrl, getDuomaiTargetUrl } from './util.js'


// var lastUrl = await getBonusArriveRedirectUrl('https://www.bonusarrive.com/link?ad=139845&c=1174&f=0', 'area-US');
// console.log(lastUrl);

var lastUrl2 = await getDuomaiTargetUrl('https://c.duomai.com/track.php?aid=40766&dm_fid=16079&euid=%7B%7BDATETIME%7D%7D&ref=1325021&t=https%3A%2F%2Fwearnumi.com%2F#ddx', 'area-US')
console.log(lastUrl2);