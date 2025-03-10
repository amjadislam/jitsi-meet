// @flow

import ButtonGroup from '@atlaskit/button/button-group';
import Button from '@atlaskit/button/standard-button';
import Modal, { ModalFooter } from '@atlaskit/modal-dialog';
import _ from 'lodash';
import React, { Component } from 'react';

import { translate } from '../../../i18n/functions';
import type { DialogProps } from '../../constants';

import ModalHeader from './ModalHeader';

/**
 * The ID to be used for the cancel button if enabled.
 *
 * @type {string}
 */
const CANCEL_BUTTON_ID = 'modal-dialog-cancel-button';

/**
 * The ID to be used for the ok button if enabled.
 *
 * @type {string}
 */
const OK_BUTTON_ID = 'modal-dialog-ok-button';

/**
 * The type of the React {@code Component} props of {@link StatelessDialog}.
 *
 * @static
 */
type Props = DialogProps & {

    /**
     * Custom dialog header that replaces the standard heading.
     */
    customHeader?: React$Element<any> | Function,

    /*
     * True if listening for the Enter key should be disabled.
     */
    disableEnter: boolean,

    /**
     * Disables dismissing the dialog when the blanket is clicked. Enabled
     * by default.
     */
    disableBlanketClickDismiss: boolean,

    /**
     * If true, the cancel button will not display but cancel actions, like
     * clicking the blanket, will cancel.
     */
    hideCancelButton: boolean,

    /**
     * If true, the close icon button will not be displayed.
     */
    hideCloseIconButton: boolean,

    /**
     * If true, no footer will be displayed.
     */
    disableFooter?: boolean,

    i18n: Object,

    /**
     * Whether the dialog is modal. This means clicking on the blanket will
     * leave the dialog open. No cancel button.
     */
    isModal: boolean,

    /**
     * The handler for the event when clicking the 'confirmNo' button.
     * Defaults to onCancel if absent.
     */
    onDecline?: Function,

    /**
     * Callback invoked when setting the ref of the Dialog.
     */
    onDialogRef?: Function,

    /**
     * Disables rendering of the submit button.
     */
    submitDisabled: boolean,

    /**
     * Function to be used to retrieve translated i18n labels.
     */
    t: Function,

    /**
     * Width of the dialog, can be:
     * - 'small' (400px), 'medium' (600px), 'large' (800px),
     *   'x-large' (968px)
     * - integer value for pixel width
     * - string value for percentage.
     */
    width: string
};

/**
 * Web dialog that uses atlaskit modal-dialog to display dialogs.
 */
class StatelessDialog extends Component<Props> {
    static defaultProps = {
        hideCloseIconButton: false
    };

    /**
     * The functional component to be used for rendering the modal footer.
     */
    _Footer: ?Function;

    _dialogElement: ?HTMLElement;

    /**
     * Initializes a new {@code StatelessDialog} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props) {
        super(props);

        // Bind event handlers so they are only bound once for every instance.
        this._onCancel = this._onCancel.bind(this);
        this._onDialogDismissed = this._onDialogDismissed.bind(this);
        this._onKeyPress = this._onKeyPress.bind(this);
        this._onSubmit = this._onSubmit.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._onDialogRef = this._onDialogRef.bind(this);
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            customHeader,
            children,
            hideCloseIconButton,
            t /* The following fixes a flow error: */ = _.identity,
            titleString,
            titleKey,
            width
        } = this.props;

        return (
            <Modal
                autoFocus = { true }
                components = {{
                    Header: customHeader ? customHeader : props => (
                        <ModalHeader
                            { ...props }
                            heading = { titleString || t(titleKey) }
                            hideCloseIconButton = { hideCloseIconButton } />
                    )
                }}
                footer = { this._renderFooter }
                i18n = { this.props.i18n }
                onClose = { this._onDialogDismissed }
                onDialogDismissed = { this._onDialogDismissed }
                shouldCloseOnEscapePress = { true }
                width = { width || 'medium' }>
                <div
                    onKeyPress = { this._onKeyPress }
                    ref = { this._onDialogRef }>
                    <form
                        className = 'modal-dialog-form'
                        id = 'modal-dialog-form'
                        onSubmit = { this._onSubmit }>
                        { children }
                    </form>
                </div>
            </Modal>
        );
    }

    _renderFooter: () => React$Node;

    /**
     * Returns a ReactElement to display buttons for closing the modal.
     *
     * @param {Object} propsFromModalFooter - The props passed in from the
     * {@link ModalFooter} component.
     * @private
     * @returns {ReactElement}
     */
    _renderFooter(propsFromModalFooter) {
        // Filter out falsy (null) values because {@code ButtonGroup} will error
        // if passed in anything but buttons with valid type props.
        const buttons = [
            this._renderOKButton(),
            this._renderCancelButton()
        ].filter(Boolean);

        if (this.props.disableFooter) {
            return null;
        }

        return (
            <ModalFooter showKeyline = { propsFromModalFooter.showKeyline } >
                {

                    /**
                     * Atlaskit has this empty span (JustifySim) so...
                     */
                }
                <span />
                <ButtonGroup>
                    { buttons }
                </ButtonGroup>
            </ModalFooter>
        );
    }

    _onCancel: () => void;

    /**
     * Dispatches action to hide the dialog.
     *
     * @returns {void}
     */
    _onCancel() {
        if (!this.props.isModal) {
            const { onCancel } = this.props;

            onCancel && onCancel();
        }
    }

    _onDialogDismissed: () => void;

    /**
     * Handles click on the blanket area.
     *
     * @returns {void}
     */
    _onDialogDismissed() {
        if (!this.props.disableBlanketClickDismiss) {
            this._onCancel();
        }
    }

    _onSubmit: (?string) => void;

    /**
     * Dispatches the action when submitting the dialog.
     *
     * @private
     * @param {string} value - The submitted value if any.
     * @returns {void}
     */
    _onSubmit(value) {
        const { onSubmit } = this.props;

        onSubmit && onSubmit(value);
    }

    /**
     * Renders Cancel button.
     *
     * @private
     * @returns {ReactElement|null} The Cancel button if enabled and dialog is
     * not modal.
     */
    _renderCancelButton() {
        if (this.props.cancelDisabled
            || this.props.isModal
            || this.props.hideCancelButton) {
            return null;
        }

        const {
            t /* The following fixes a flow error: */ = _.identity,
            onDecline
        } = this.props;

        return (
            <Button
                appearance = 'subtle'
                id = { CANCEL_BUTTON_ID }
                key = 'cancel'
                onClick = { onDecline || this._onCancel }
                type = 'button'>
                { t(this.props.cancelKey || 'dialog.Cancel') }
            </Button>
        );
    }

    /**
     * Renders OK button.
     *
     * @private
     * @returns {ReactElement|null} The OK button if enabled.
     */
    _renderOKButton() {
        if (this.props.submitDisabled) {
            return null;
        }

        const {
            t /* The following fixes a flow error: */ = _.identity
        } = this.props;

        return (
            <Button
                appearance = 'primary'
                form = 'modal-dialog-form'
                id = { OK_BUTTON_ID }
                isDisabled = { this.props.okDisabled }
                key = 'submit'
                onClick = { this._onSubmit }
                type = 'button'>
                { t(this.props.okKey || 'dialog.Ok') }
            </Button>
        );
    }

    _onDialogRef: (?Element) => void;

    /**
     * Callback invoked when setting the ref of the dialog's child passing the Modal ref.
     * It is done this way because we cannot directly access the ref of the Modal component.
     *
     * @param {HTMLElement} element - The DOM element for the dialog.
     * @private
     * @returns {void}
     */
    _onDialogRef(element: ?Element) {
        this.props.onDialogRef && this.props.onDialogRef(element && element.parentNode);
    }

    _onKeyPress: (Object) => void;

    /**
     * Handles 'Enter' key in the dialog to submit/hide dialog depending on
     * the available buttons and their disabled state.
     *
     * @param {Object} event - The key event.
     * @private
     * @returns {void}
     */
    _onKeyPress(event) {
        // If the event coming to the dialog has been subject to preventDefault
        // we don't handle it here.
        if (event.defaultPrevented) {
            return;
        }

        if (event.key === 'Enter' && !this.props.disableEnter) {
            event.preventDefault();
            event.stopPropagation();

            if (this.props.submitDisabled && !this.props.cancelDisabled) {
                this._onCancel();
            } else if (!this.props.okDisabled) {
                this._onSubmit();
            }
        }
    }
}

export default translate(StatelessDialog);
