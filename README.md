# CommonJS2 Module for QuickJS

"乞丐版"的[commonjs2 module](http://www.commonjs.org/specs/modules/1.0/)实现示例，可以运行在[QuickJS](https://bellard.org/quickjs/)引擎。

## 安装`QuickJS`

### MacOS

```shell script
brew install quickjs
```

### 其它平台

参考[QuickJS 快速入门](https://github.com/gaobowen/quickjs-examples)

## 尝试示例

> 示例部分代码来自`Node.js`官方文档。

```shell script
qjs ./demo/index.js
```

## 其它说明

> 该代码仅供娱乐使用，请勿用于生产环境。

- 文件操作实现参考[QuickJs文档](https://bellard.org/quickjs/quickjs.html)
- 代码实现规范参考[Node.js modules](https://nodejs.org/dist/latest-v12.x/docs/api/modules.html)
- 源码中的[path](https://github.com/nodejs/node/blob/v0.12/lib/path.js)部分来源于`Node.js`源码
- 皇帝版的[module](https://github.com/nodejs/node/blob/v0.12/lib/module.js)实现可以参考`Node.js`源码
