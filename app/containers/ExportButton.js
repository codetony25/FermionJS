import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../components/photon.css';
import coreStyles from '../components/Core.css';
import WorkspaceConverter from '../utilities/WorkspaceConverter';
import WorkspaceExporter from '../utilities/WorkspaceExporter';
import path from 'path';

const EXPORT_DIR = 'export';
class ExportButton extends Component {
  constructor(props) {
    super(props);
    this.exportCode = this.exportCode.bind(this);
  }

  exportCode() {
    const destinationDir = path.join(__dirname, EXPORT_DIR);
    try {
      const wc = new WorkspaceConverter(this.props.components);
      const exporter = new WorkspaceExporter(destinationDir, wc.convert());
      exporter.deleteDir();
      exporter.export();
      console.log('successful export to:', destinationDir);
    } catch (e) {
      console.log(e);
    }
  }
  render() {
    return (
      <button className={`${styles.btn} ${styles['btn-primary']} ${styles['pull-right']} ${coreStyles.btn}`} onClick={this.exportCode}>Export</button>
    );
  }
}

function mapStateToProps(state) {
  return {
    components: state.workspace.components
  };
}

export default connect(mapStateToProps, {})(ExportButton);