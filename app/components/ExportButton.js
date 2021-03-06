import styles from '../components/photon.scss';
import coreStyles from '../components/Core.scss';
import WorkspaceConverter from '../utilities/WorkspaceConverter';
import WorkspaceExporter from '../utilities/WorkspaceExporter';
import path from 'path';
import React, { Component } from 'react';
const EXPORT_DIR = 'export_files/src/components';
export default class ExportButton extends Component {
  constructor(props) {
    super(props);
    this.exportCode = this.exportCode.bind(this);
  }

  exportCode() {
    const destinationDir = path.join(__dirname, EXPORT_DIR);
    try {
      // let wc = new WorkspaceConverter(this.props.components);
      let wc = new WorkspaceConverter(this.props.workspace);
      let exporter = new WorkspaceExporter(destinationDir, wc.convert());
      exporter.deleteDir();
      exporter.export();
    } catch(e) {
      console.log(e);
    }
  }
  render() {
    return (
      <button className={`${styles.btn} ${styles['btn-primary']} ${styles['pull-right']} ${coreStyles.btn}`} onClick={this.exportCode}>Export</button>
    );
  }
}
