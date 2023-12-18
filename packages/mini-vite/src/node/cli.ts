import cac from "cac";
import { startDevServer } from "./server";

const cli = cac();
console.log('>>>cli start');
// [] 中的内容为可选参数，也就是说仅输入 `vite` 命令下会执行下面的逻辑
cli
  .command('[root]', 'start dev server')
  .alias("serve")
  .alias("dev")
  .action(async () => {
    console.log('>>>mini-vite dev action\n');
    startDevServer();
  }); // 注册指令回调
cli.help() // 支持 --help 查看命令
cli.parse() // 解析参数