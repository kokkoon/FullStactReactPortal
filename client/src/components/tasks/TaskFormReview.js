// SurveyFormReview show users their form inputs for review
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import formFields from './formFields';
import { withRouter } from 'react-router';
import * as actions from '../../actions';

const TaskFormReview = ({ onCancel, formValues, submitTask, history }) => {
  const reviewFields = _.map(formFields, ({ name, label }) => {
    return (
      <div key={name}>
        <label>{label}</label>
        <div>
          {formValues[name]}
        </div>
      </div>
    );
  });

  return (
    <div>
      <h5>Please confirm your entries</h5>
      {reviewFields}
      <button className="yellow darken-3 white-text btn-flat"
        onClick={onCancel}
      >
        Back
      </button>
      <button className="green btn-flat right white-text"
        onClick={() => submitTask(formValues, history)}
      >
        Send Task
        <i className="material-icons right">email</i>
      </button>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    formValues: state.form.taskForm.values
  };
}

export default connect(mapStateToProps, actions)(withRouter(TaskFormReview));
