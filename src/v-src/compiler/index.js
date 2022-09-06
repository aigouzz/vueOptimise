/**
 * 编译器
 * template中原生html和非原生的元素编译，也就是render函数，render将模板生成对应vnode，vnode经过patch得到将要渲染的VNode，
 * 根据渲染VNode生成真实的dom节点插入到视图中，完成更新
 * 用户写的模板 -- 》模板编译--》render函数--》VNode--》patch--》视图
 * 
 * AST:abstract syntax tree
 * 抽象语法树：
 * 流程：1：模板解析阶段：将一堆字符串用正则等方式解析成抽象语法树ast  src/compiler/parser/index.js
 * 2：优化阶段：遍历ast，找出其中静态节点，并做标记 src/compiler/optimiser.js
 * 3：代码生成阶段：将ast转换成渲染函数  src/compiler/codegen/index.js
 * 
 */
import {parse} from './parser/index';
import {optimize} from './optimizer';
import {generate} from './codegen/index';
import {createCompilerCreator} from './create-compiler';

export const createCompiler = createCompilerCreator(function(
    template,
    options
) {
    let ast = parse(template.trim(), options);
    if(options.optimize !== false) {
        optimize(ast, options);
    }
    let code = generate(ast, options);

    return {
        ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
    };
});