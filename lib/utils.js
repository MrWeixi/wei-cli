const ora = require("ora");
async function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, n);
  });
}
async function wrapLoading(fn, message, ...args) {
  const spinner = ora(message);
  spinner.start(); //开启加载
  try {
    let repos = await fn(...args);
    spinner.succeed(); //成功
    return repos;
  } catch (e) {
    spinner.fail("request failed ,refetch...");
    await sleep(1000); //间隔1秒拉取
    return wrapLoading(fn, message, ...args); //递归
  }
}


module.exports = {
  wrapLoading,
};
