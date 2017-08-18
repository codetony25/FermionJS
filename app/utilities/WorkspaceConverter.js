const PAD_LENGTH = 3;
const WORKSPACE_ID = 'workspace';
const TOP_LEVEL_NAME = 'App';
const { propsParser, flattenStateProps } = require('./propsRecursor');
const { cloneDeep } = require('lodash');
let state;
let statemap;
//    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    targetLength >>= 0; // floor if number or convert non-number to 0;
    padString = String(padString || ' ');
    if (this.length > targetLength) {
      return String(this);
    }

    targetLength -= this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
    }
    return padString.slice(0, targetLength) + String(this);
  };
}

const padName = (name, id) => `${name}_${id.padStart(PAD_LENGTH, '0')}`;

class ComponentConverter {
  constructor(component, components) {
    this.component = component;
    this.components = components;
    console.log('c: ', this.component);
    this.children = components[component.id].children;
  }
  get ext() {
    return '.js';
  }
  get fileName(){
    if (this.component.id === WORKSPACE_ID){
      return TOP_LEVEL_NAME;
    }
    return padName(this.component.name, this.component.id.toString())
  }
  get id() {
    return this.component.id;
  }
  get name() {
    return this.component.name;
  }
  getImports() {
    return this.component.childrenFileNames.reduce((final, childFile) => {
      final += `import ${childFile} from '../${childFile}/${childFile}'` + '\n';
      return final;
    }, '');
  }
  getChildren() {
    return this.component.childrenFileNames.reduce((final, childFile, i, array) => {
      console.log(childFile);
      final += `        <${childFile}\n ${this.getChildProps(childFile)} /> `;
      // if (i === array.length - 1) final += '\n';
      final += '\n';
      return final;
    }, '\n');
  }
  getClass() {
    return `${this.component.name}`;
  }
  getStyle() {
    let style;
    if (!this.component.props){
      style = {height: '100vh', width:'100vw', 'backgroundColor': '#FFF', 'margins': '0px'};
    } else {
      style = this.component.props.style;
    }
    return JSON.stringify(style);
  }

  getProps() {
    // const props = Object.assign({}, this.component.props);
    let props;
    if (this.component.id !== WORKSPACE_ID){
      props = flattenStateProps(this.component.props, this.component.id, this.components);
    } else {
      return '';
    }
    delete props.style;
    return Object.keys(props).reduce((final, key) => {
      final += `\n        ${key}={${props[key]}}`;
      return final;
    }, '');
  }
    // obj destructures props in render method automatically.
  destructureProps() {
    let props;
    if (this.component.id !== WORKSPACE_ID){
      props = flattenStateProps(this.component.props, this.component.id, this.components);
    } else {
      return '';
    }
    delete props.style;
      const destructuredProps = Object.keys(props).reduce((final, key) => {
      final += `${key}, `;
      return final;
    }, 'const { ');
    return destructuredProps.slice(0, destructuredProps.length - 2) + ' } = this.props;'
  }
    //adds child props to component calls in JSX.
  getChildProps(childFile) {
    const child = parseInt(childFile.slice(-3));
    let childProps;
    if (this.component.id !== WORKSPACE_ID){
        childProps = cloneDeep(this.component.props[child]);
    } else {
      childProps = flattenStateProps(this.components[child].props, String(child), this.components);
    }
      delete childProps.style;
      console.log('cp: ',childProps);
      return Object.keys(childProps).reduce((inline, prop) => {
        inline+= `        ${prop}={${childProps[prop]}}\n`;
        return inline;
      }, '');
  }

  generateCode() {
    const className = this.getClass();
    return (
`
import React, { Component } from 'react'
${this.getImports()}
const divStyle = ${this.getStyle()}
class ${className} extends Component {
  constructor(props){
    super(props);
  ${className === 'App' ? `this.state = ${state.replace(/\"/g, "")}` : `` }
  }
  render(){
    ${this.destructureProps()}
    return (
      <div style={divStyle}>
        ${this.getChildren()}
      </div>
    )
  }
}
export default ${className};
`
    );
  }
}
class WorkspaceConverter {
  constructor(workspace){
    const clonedWorkspace = propsParser(workspace);
    let comps = Object.assign({}, clonedWorkspace.components);
    statemap = JSON.stringify(Object.assign({}, clonedWorkspace.state));
    console.log(statemap);
    state = JSON.stringify(Object.assign({}, flattenStateProps(clonedWorkspace.state, 'workspace', clonedWorkspace.components)), '  ');
    comps[WORKSPACE_ID].name = TOP_LEVEL_NAME;
    this.components = this.convertChildIDtoFileName(comps);
  }
  convertChildIDtoFileName(components){
    let converted = Object.keys(components).reduce((acc, id)=>{
      let newComponent = Object.assign({}, components[id]);
      newComponent.childrenFileNames = components[id].children.map(childID =>{
        return padName(components[childID].name, components[childID].id.toString())
      });
      acc[id] = newComponent;
      return acc;
    }, {});
    return converted;
  }
  convert(){
    return Object.keys(this.components).reduce((acc, key)=>{
      const cc = new ComponentConverter(this.components[key], this.components);
      acc.push({
        name: cc.name,
        id: cc.id,
        fileName: cc.fileName,
        ext: cc.ext,
        code: cc.generateCode() });
      return acc;
    }, []);
  }
}
module.exports = WorkspaceConverter;
