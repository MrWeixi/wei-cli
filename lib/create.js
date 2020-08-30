const path = require("path");
const fs = require("fs-extra");
const Inquirer = require("inquirer");
const Creator =require("./Creator");
module.exports = async function (projectName, option) {
  // 创建项目
  const cwd = process.cwd(); //获取当前命令执行时的工作目录
  const targetDir = path.join(cwd, projectName);
  if (fs.existsSync(targetDir)) {
    if (option.force) {
      
      // 如果强制创建 就删除
      await fs.remove(targetDir);
    } else {
      let { action } = await Inquirer.prompt([
        //配置询问的方式
        {
          name: "action",
          type: "list",
          message: "Target directory already exsts Pick an action",
          choices: [
            { name: "Overwrite", value: "overwrite" },
            { name: "Cancel", value: false },
          ],
        },
      ]);
      if (!action) {
        return;
      } else if (action === "overwrite") {
        await fs.remove(targetDir);
      }
    }
  }
  // 创建项目
 const creator  = new Creator(projectName,targetDir);
 creator.create();
};
