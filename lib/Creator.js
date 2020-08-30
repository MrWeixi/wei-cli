const { fetchRepoList, fetchTagList } = require("./request");
const Inquirer = require("inquirer");
const ora = require("ora");
const { wrapLoading } = require("./utils");
const downloadGitRepo = require("download-git-repo"); //不支持promise
const util = require("util");
const path = require("path");

class Creator {
  constructor(projectName, targetDir) {
    this.name = projectName;
    this.target = targetDir;
    this.downloadGitRepo = util.promisify(downloadGitRepo); //转化为promise方法
  }
  async fetchRepo() {
    //创建过程
    //失败重新获取
    let repos = await wrapLoading(fetchRepoList, "waiting fetch template");
    if (!repos) return;
    repos = repos.map((item) => item.name);
    let { repo } = await Inquirer.prompt({
      name: "repo",
      type: "list",
      choices: repos,
      message: "please choose a template to create project",
    });
    return repo;
  }
  async fetchTag(repo) {
    let tags = await wrapLoading(fetchTagList, "waiting fetch tagList", repo);
    if (!tags) return;
    tags = tags.map((item) => item.name);
    let { tag } = await Inquirer.prompt({
      name: "tag",
      type: "list",
      choices: tags,
      message: "please choose a tag to create project",
    });
    return tag;
  }
  async download(repo, tag) {
    const spinner = ora("Is downloading");
    spinner.start(); //正在
    let requestUrl = `zhu-cli/${repo}${tag ? "#" + tag : ""}`;
    // 1、需要拼接下载路径
    // 可以增加缓存功能，应该下载到系统目录中，稍后可以使用 ejs handlerbar 去渲染 最后生成成果写入
    // 2、把资源下载 到某个路径上
    try {
      await this.downloadGitRepo(
        requestUrl,
        path.resolve(process.cwd(), `${repo}@${tag}`)
      );
      spinner.succeed(); //下载成功
      return this.target;
    } catch (e) {
      spinner.fail("Download failed...");
    }
    //  "axios": "^0.20.0",
    //  "chalk": "^4.1.0",
    //  "commander": "^6.0.0",
    //  "download-git-repo": "^3.0.2",
    //  "fs-extra": "^9.0.1",
    //  "inquirer": "^7.3.3",
    //  "ora": "^5.0.0"
  }
  async create() {
    //创建步骤
    //采用远程拉取 https://api.github.com/orgs/zhu-cli/repos
    // 1、拉取模板
    let repo = await this.fetchRepo();
    // 2、找模板版本号
    let tag = await this.fetchTag(repo);
    // 3、下载
    await this.download(repo, tag);
  }
}
module.exports = Creator;
