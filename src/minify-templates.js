import { minify } from 'html-minifier'

const expressionPlaceholder = '--MINIFYLITEXPRESSION--';
const expressionPlaceholderMatcher = new RegExp(expressionPlaceholder, 'g');

function mapStack(stack) {
    return stack.map(item => Object.assign({}, item, { node: item.node.type }));
}

export class MinifyTemplate {
    constructor(code, output, options) {
        // args
        this.code = code;
        this.magicString = output;
        this.options = options;

        // algo
        this._inTemplateLiteral = false;
        this.MainStack = [];
        this.ExpressionStack = [];
        this.ResultStack = [];

        // state
        this._edited = false;
    }

    enter(node) {
        if(node.type === 'TemplateElement') {
            if(this.MainStack.length === 0) {
                throw new Error("Encountered TemplateElement outside of TemplateLiteral. Not implemented.");
            }

            this.MainStack[this.MainStack.length-1].stack.push(node);
            return;
        }

        if(this._inTemplateLiteral) {
            this._inTemplateLiteral = false;
            this.ExpressionStack.push({
                node,
                hasTemplateChild: false
            });
        }

        if(node.type === 'TemplateLiteral') {
            this._inTemplateLiteral = true;
            this.MainStack.push({
                node,
                stack: []
            });
            if(this.ExpressionStack.length > 0) {
                this.ExpressionStack[this.ExpressionStack.length-1].hasTemplateChild = true;
            }
        }
    }

    leave(node) {
        if(node.type === 'TemplateLiteral') {
            this._inTemplateLiteral = false;
            const currentLiteral = this.MainStack.pop();
            if(currentLiteral.node !== node) {
                throw new Error("Left a TemplateLiteral that was not on top of the MainStack. Not implemented.");
            }

            const value = currentLiteral.stack.reverse().map(node => node.value.raw).join(expressionPlaceholder);
            const transformed = "`" + minify(value, this.options) + "`";
            const output = transformed.replace(expressionPlaceholderMatcher, match => {
                if(this.ResultStack.length === 0) {
                    throw new Error("No Expression found for Replacement. Unexpected.");
                }
                return this.ResultStack.pop().value;
            });

            if(this.MainStack.length > 0) {
                this.ResultStack.push({
                    node,
                    value: output
                });
            } else {
                this._edited = true;
                this.magicString.overwrite(node.start, node.end, output);
            }
        }

        if(this.ExpressionStack.length > 0 && this.ExpressionStack[this.ExpressionStack.length-1].node === node) {
            this._inTemplateLiteral = true;
            const currentExpression = this.ExpressionStack.pop();

            let exprValue = "";
            if(!currentExpression.hasTemplateChild) {
                exprValue = "${" + this.code.substring(node.start, node.end) + "}";
            } else {
                const templateResult = this.ResultStack.pop();
                exprValue =
                    "${" +
                    this.code.substring(node.start, templateResult.node.start) +
                    templateResult.value +
                    this.code.substring(templateResult.node.end, node.end) +
                    "}";
            }

            this.ResultStack.push({
                node,
                value: exprValue
            });
        }
    }

    get edited() {
        return this._edited;
    }
}
