// License: LGPL-3.0-or-later
import * as React from 'react';
import { observer, inject } from 'mobx-react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import * as _ from 'lodash';
import { Address, TimeoutError, ValidationErrorsException } from '../../../api';
import { BasicField } from '../common/fields';
import ReactCheckbox from '../common/form/ReactCheckbox';
import FormNotificationBlock from '../common/form/FormNotificationBlock';
import Button from '../common/form/Button';
import { TwoColumnFields } from '../common/layout';
import { LocalRootStore } from './local_root_store';
import { AddressPaneState } from './address_pane_state';
import { Formik, Form, FormikFormProps, Field, FieldProps, FieldAttributes, FormikHandlers, FormikActions, FormikErrors, FormikProps } from 'formik'
import { FormikField } from '../common/form/FormikField';
import FormikBasicFieldComponent from '../common/FormikBasicField';
import FormikBasicField from '../common/FormikBasicField';
import { FieldCreator } from '../common/form/FieldCreator';
import { FormikCheckbox } from '../common/form/FormikCheckbox';
import { action } from 'mobx';

export interface AddressAction {
  type: 'none' | 'delete' | 'add' | 'update'
  address?: Address
  setToDefault?: boolean
}

export interface AddressPaneProps {
  initialAddress: Address
  isDefault?: boolean
  onClose?: (action: AddressAction) => void
  LocalRootStore?: LocalRootStore
  //Only used for testing
  addressPaneState?: AddressPaneState
}


class AddressPane extends React.Component<AddressPaneProps & InjectedIntlProps, {}> {


  constructor(props: AddressPaneProps & InjectedIntlProps) {
    super(props)
    // this.addressPaneState = props.addressPaneState || new AddressPaneState(props.initialAddress, props.isDefault, props.LocalRootStore, props.onClose)
    this.initialize(props.initialAddress, props.isDefault)
  }




  initialize(initialAddress: Address, isDefault: boolean) {
    this.shouldAdd = (!initialAddress || !initialAddress.id)
    this.initialValues = this.shouldAdd ? {} : {
      'id': initialAddress.address,
      'address': initialAddress.address,
      'city': initialAddress.city,
      'state_code': initialAddress.state_code,
      'zip_code': initialAddress.zip_code,
      'country': initialAddress.country,
      'is_default': isDefault
    }
  }

  initialValues: any
  shouldAdd: boolean



  @action.bound
  async tryToSubmitForm<Values>(values: any, action: FormikActions<Values>) {
    let input = values

    let status: { form?: string, fields?: FormikErrors<Values> } = {}

    try {
      if (this.shouldAdd) {
        const address = await this.props.LocalRootStore.supporterAddressStore.createAddress(input)

        this.props.onClose({ type: 'add', address: address, setToDefault: values['is_default'] })
      }
      else {
        const address = await this.props.LocalRootStore.supporterAddressStore.updateAddress(values['id'], input)

        this.props.onClose({ type: 'update', address: address, setToDefault: values['is_default'] })
      }

    }
    catch (e) {
      if (e instanceof TimeoutError) {
        status.form = "The website couldn't be contacted. Make sure you're connected to the internet and try again in a few seconds."
      }
      else {
        if (e instanceof ValidationErrorsException) {
          status.fields = this.convertValidationErrorToServerErrorInput(e)
        }

        status.form = e['error']
      }

      action.setStatus(status)
    }
  }

  render() {
    return <Formik initialValues={this.initialValues as Address & { isDefault?: boolean }} onSubmit={this.tryToSubmitForm} render={(props: FormikProps<Address & { isDefault?: boolean }>) => {
      props.touched.isDefault &&
        (this.form.$('is_default').isDirty && (this.form.$('address').isEmpty
          && this.form.$('city').isEmpty
          && this.form.$('state_code').isEmpty
          && this.form.$('zip_code').isEmpty
          && this.form.$('country').isEmpty)

      return (
        <form onSubmit={i.handleSubmit} onReset={i.handleReset}>
          <div>
            <TwoColumnFields>
              <FieldCreator component={FormikBasicField} name={'address'} label={'Address'} />
              <FieldCreator component={FormikBasicField} name={'city'} label={'City'} />

            </TwoColumnFields>
            <TwoColumnFields>
              <FieldCreator component={FormikBasicField} name={'state_code'} label={'State/Region Code'} />
              <FieldCreator component={FormikBasicField} name={'zip_code'} label={'Postal/Zip Code'} />

            </TwoColumnFields>
            <TwoColumnFields>
              <FieldCreator component={FormikBasicField} name={'country'} label={'Country'} />
            </TwoColumnFields>
            <FieldCreator component={FormikCheckbox} name={'is_default'} label={"Set as Default Address"} />

            {
              (i.status && i.status.form) ? <FormNotificationBlock>{i.status.form}</FormNotificationBlock> : ""
            }
          </div>
          <div>

            <Button onClick={() => this.props.onClose({ type: 'none' })}>Close</Button>
            {this.shouldAdd ?
              <>
                <Button type="submit">Add</Button>
              </> :
              <>
                <Button type="submit">Save</Button>
                <Button type="submit">Delete</Button>
              </>
            }
          </div>
        </form>)
    }
    } />

    {/* <TwoColumnFields>
            <BasicField field={this.addressPaneState.form.$('address')} label={"Address"} />
            <BasicField field={this.addressPaneState.form.$('city')} label={"City"} />
          </TwoColumnFields>
          <TwoColumnFields>
            <BasicField field={this.addressPaneState.form.$('state_code')} label={"State Code/Region"} />
            <BasicField field={this.addressPaneState.form.$('zip_code')} label={"Postal/Zip Code"} />
          </TwoColumnFields>
          <TwoColumnFields>
            <BasicField field={this.addressPaneState.form.$('country')} label={"Country"} />
          </TwoColumnFields>
          <ReactCheckbox field={this.addressPaneState.form.$('is_default')} label={"Set as Default Address"} />

          {this.addressPaneState.form.serverError ? <FormNotificationBlock>{this.addressPaneState.form.serverError}</FormNotificationBlock> : ""}
        </form>
      </div> */}
    {/* <div>

        <Button onClick={() => this.addressPaneState.close({ type: 'none' })}>Close</Button>
        {this.addressPaneState.shouldAdd ?
          <>
            <Button onClick={this.addressPaneState.form.onSubmit} disabled={!this.addressPaneState.modifiedEnoughToSubmit} type="submit">Add</Button>
          </> :
          <>
            <Button onClick={this.addressPaneState.form.onSubmit} disabled={!this.addressPaneState.modifiedEnoughToSubmit} type="submit">Save</Button>
            <Button onClick={this.addressPaneState.delete}>Delete</Button>
          </>
        }
      </div> */}

  }
}

export default injectIntl(inject('LocalRootStore')(observer(AddressPane)))



