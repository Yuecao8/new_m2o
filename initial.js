const chalk = require('chalk');
const argv = require('yargs').argv;

const tip = {
    basic: '基础版',
    standard: '标准版',
    professional: '专业版',
    ultimate: '旗舰版',

    en: '英文',
    zh_cn: '中文',

    development: '开发',
    production: '生产',
}

const abbr = {
    basic: 'basic',
    standard: 'std',
    professional: 'pro',
    ultimate: 'ult',
    zh_cn: 'zh-CN',
    en: 'en',
}

if (!argv.e) {
    argv.e = 'ultimate'
}
if (!argv.l) {
    argv.l = 'zh_cn'
}
if (!argv.c) {
    argv.c = new Date().getTime()
}

console.log(chalk.green(`环境：【${tip[process.env.NODE_ENV]}】\t版本：【${tip[argv.e]}】\t版本号(code)：【${argv.c}】\t语言：【${tip[argv.l]}】\n`));

process.env.EDITION = abbr[argv.e];
process.env.LANG = abbr[argv.l];
process.env.VERSION = argv.c;
