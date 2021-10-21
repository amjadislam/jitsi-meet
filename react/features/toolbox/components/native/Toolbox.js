// @flow

import React from 'react';
import { SafeAreaView, TouchableWithoutFeedback, View } from 'react-native';

import UIEvents from '../../../../../service/UI/UIEvents';
import { appNavigate } from '../../../app/actions';
import { setAudioOnly } from '../../../base/audio-only';
import { ColorSchemeRegistry } from '../../../base/color-scheme';
import {
    MEDIA_TYPE,
    setVideoMuted,
    toggleCameraFacingMode, VIDEO_MUTISM_AUTHORITY
} from '../../../base/media';
import { connect } from '../../../base/redux';
import { StyleType } from '../../../base/styles';
import {
    getLocalVideoType,
    isLocalCameraTrackMuted,
    isLocalTrackMuted
} from '../../../base/tracks';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp
} from '../../../base/util/responsiveLayout';
import { ChatButton } from '../../../chat';
import { ParticipantsPaneButton } from '../../../participants-pane/components/native';
import { ReactionsMenuButton } from '../../../reactions/components';
import { isReactionsEnabled } from '../../../reactions/functions.any';
import { TileViewButton } from '../../../video-layout';
import { muteLocal } from '../../../video-menu/actions.any';
import { isToolboxVisible, getMovableButtons } from '../../functions.native';
import AudioMuteButton from '../AudioMuteButton';
import HangupButton from '../HangupButton';
import VideoMuteButton from '../VideoMuteButton';

import OverflowMenuButton from './OverflowMenuButton';
import RaiseHandButton from './RaiseHandButton';
import ToggleCameraButton from './ToggleCameraButton';
import styles from './styles';


/**
 * The type of {@link Toolbox}'s React {@code Component} props.
 */
type Props = {

    /**
     * The color-schemed stylesheet of the feature.
     */
    _styles: StyleType,

    /**
     * The indicator which determines whether the toolbox is visible.
     */
    _visible: boolean,

    /**
     * The width of the screen.
     */
    _width: number,

    /**
     * Whether or not the reactions feature is enabled.
     */
    _reactionsEnabled: boolean,

    /**
     * The redux {@code dispatch} function.
     */
    dispatch: Function
};

/**
 * Implements the conference Toolbox on React Native.
 *
 * @param {Object} props - The props of the component.
 * @returns {React$Element}.
 */
function Toolbox(props: Props) {
    if (!props._visible) {
        return null;
    }

    /**
     * Indicates if video is currently muted ot nor.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    function _isVideoMuted() {
        return props._videoMuted;
    }

    /**
     * Changes the muted state.
     *
     * @override
     * @param {boolean} videoMuted - Whether video should be muted or not.
     * @protected
     * @returns {void}
     */
    function _setVideoMuted(videoMuted: boolean) {
        // sendAnalytics(createToolbarEvent(VIDEO_MUTE, { enable: videoMuted }));
        if (props._audioOnly) {
            props.dispatch(
                setAudioOnly(false, /* ensureTrack */ true));
        }
        const mediaType = props._videoMediaType;

        props.dispatch(
            setVideoMuted(
                videoMuted,
                mediaType,
                VIDEO_MUTISM_AUTHORITY.USER,
                /* ensureTrack */ true));

        // FIXME: The old conference logic still relies on this event being
        // emitted.
        typeof APP === 'undefined'
        || APP.UI.emitEvent(UIEvents.VIDEO_MUTED, videoMuted, true);
    }

    /**
     * Indicates if audio is currently muted ot nor.
     *
     * @override
     * @protected
     * @returns {boolean}
     */
    function _isAudioMuted() {
        return props._audioMuted;
    }

    /**
     * Changes the muted state.
     *
     * @param {boolean} audioMuted - Whether audio should be muted or not.
     * @protected
     * @returns {void}
     */
    function _setAudioMuted(audioMuted: boolean) {
        props.dispatch(muteLocal(audioMuted, MEDIA_TYPE.AUDIO));
    }

    const { _styles, _width, _reactionsEnabled } = props;
    const { buttonStylesBorderless, hangupButtonStyles, toggledButtonStyles } = _styles;
    const additionalButtons = getMovableButtons(_width);
    const backgroundToggledStyle = {
        ...toggledButtonStyles,
        style: [
            toggledButtonStyles.style,
            _styles.backgroundToggle
        ]
    };

    const endButtonSize = hp('8.5%');
    const buttonSize = hp('4.5%');
    const showColors = false;

    return (
        <View
            pointerEvents = 'box-none'
            style = { styles.toolboxContainer }>
            {/* <View
                pointerEvents = 'box-none'
                style = {{
                    alignSelf: 'flex-end',
                    marginEnd: wp('10%'),
                    marginBottom: hp('5%')
                }}>
                <TouchableWithoutFeedback
                    onPressIn = { () => _setAudioMuted(!_isAudioMuted()) }
                    onPressOut = { () => _setAudioMuted(!_isAudioMuted()) }>
                     onPress = { () => {
                         // console.log('Mute/Unmute audio clicked!');
                         _setAudioMuted(!_isAudioMuted());
                     } }>
                    <View
                        style = {{ height: buttonSize * 2,
                            width: buttonSize * 2,
                            opacity: 0.3,

                            // backgroundColor: _isAudioMuted() ? 'transparent' : 'transparent',
                            backgroundColor: showColors ? 'orange' : 'transparent',
                            borderRadius: 40 }} />
                </TouchableWithoutFeedback>
            </View>*/}
            <SafeAreaView
                accessibilityRole = 'toolbar'
                pointerEvents = 'box-none'

                // style = { styles.toolbox }
                style = {{
                    alignItems: 'center',
                    flexDirection: 'row',
                    width: '100%',
                    height: hp('10%'),
                    justifyContent: 'space-evenly'
                }}>
                <View
                    style = {{
                        height: buttonSize,
                        width: buttonSize,
                        backgroundColor: showColors ? 'blue' : 'transparent'
                    }} />

                <TouchableWithoutFeedback onPress = { () => _setAudioMuted(!_isAudioMuted()) }>
                    <View
                        style = {{
                            height: buttonSize,
                            width: buttonSize,
                            opacity: 0.3,

                            // backgroundColor: _isAudioMuted() ? 'transparent' : 'transparent',
                            backgroundColor: showColors ? 'orange' : 'transparent',
                            borderRadius: 40 }} />
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                    onPress = { () => {
                        // console.log('End call clicked!');
                        // props.dispatch(appNavigate(undefined));
                    } }>
                    <View
                        style = {{ height: endButtonSize,
                            width: endButtonSize,
                            backgroundColor: showColors ? 'red' : 'transparent' }} />
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                    onPress = { () => {
                        // console.log('Camera Mute/Unmute Clicked!');
                        _setVideoMuted(!_isVideoMuted());
                    } }>
                    <View
                        style = {{ height: buttonSize,
                            width: buttonSize,
                            opacity: 0.3,

                            // backgroundColor: _isVideoMuted() ? 'transparent' : 'transparent',
                            backgroundColor: showColors ? 'purple' : 'transparent',
                            borderRadius: 40 }} />
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                    onPress = { () => {
                        props.dispatch(toggleCameraFacingMode());

                        // console.log('Camera toggle Clicked!');
                    } }>
                    <View
                        style = {{ height: buttonSize,
                            width: buttonSize,
                            backgroundColor: showColors ? 'green' : 'transparent' }} />
                </TouchableWithoutFeedback>
                <View
                    pointerEvents = 'box-none'
                    style = {{
                        alignSelf: 'flex-end',

                        // marginEnd: wp('10%'),
                        marginBottom: hp('1%')
                    }}>
                    <TouchableWithoutFeedback
                        onPressIn = { () => _setAudioMuted(!_isAudioMuted()) }
                        onPressOut = { () => _setAudioMuted(!_isAudioMuted()) }>
                        {/* onPress = { () => {*/}
                        {/*     // console.log('Mute/Unmute audio clicked!');*/}
                        {/*     _setAudioMuted(!_isAudioMuted());*/}
                        {/* } }>*/}
                        <View
                            style = {{ height: buttonSize * 2,
                                width: buttonSize * 2,
                                opacity: 0.3,

                                // backgroundColor: _isAudioMuted() ? 'transparent' : 'transparent',
                                backgroundColor: showColors ? 'orange' : 'transparent',
                                borderRadius: 40 }} />
                    </TouchableWithoutFeedback>
                </View>
                {/*  <AudioMuteButton
                    styles = { buttonStylesBorderless }
                    toggledStyles = { toggledButtonStyles } />
                <VideoMuteButton
                    styles = { buttonStylesBorderless }
                    toggledStyles = { toggledButtonStyles } />
                 { additionalButtons.has('chat')
                      && <ChatButton
                          styles = { buttonStylesBorderless }
                          toggledStyles = { backgroundToggledStyle } />}

                 { additionalButtons.has('raisehand') && (_reactionsEnabled
                    ? <ReactionsMenuButton
                        styles = { buttonStylesBorderless }
                        toggledStyles = { backgroundToggledStyle } />
                    : <RaiseHandButton
                        styles = { buttonStylesBorderless }
                        toggledStyles = { backgroundToggledStyle } />)}
                 {additionalButtons.has('tileview') && <TileViewButton styles = { buttonStylesBorderless } />}
                 {additionalButtons.has('participantspane')
                 && <ParticipantsPaneButton
                    styles = { buttonStylesBorderless } />
                 }
                 {additionalButtons.has('togglecamera')
                      && <ToggleCameraButton
                          styles = { buttonStylesBorderless }
                          toggledStyles = { backgroundToggledStyle } />}
                 <HangupButton
                    styles = { hangupButtonStyles } />
                 <OverflowMenuButton
                    styles = { buttonStylesBorderless }
                    toggledStyles = { toggledButtonStyles } />*/}
            </SafeAreaView>
        </View>
    );
}

/**
 * Maps parts of the redux state to {@link Toolbox} (React {@code Component})
 * props.
 *
 * @param {Object} state - The redux state of which parts are to be mapped to
 * {@code Toolbox} props.
 * @private
 * @returns {Props}
 */
function _mapStateToProps(state: Object): Object {
    const tracks = state['features/base/tracks'];
    const { enabled: audioOnly } = state['features/base/audio-only'];

    return {
        _styles: ColorSchemeRegistry.get(state, 'Toolbox'),

        // _visible: isToolboxVisible(state),
        _visible: true,
        _width: state['features/base/responsive-ui'].clientWidth,
        _reactionsEnabled: isReactionsEnabled(state),
        _videoMuted: isLocalCameraTrackMuted(tracks),
        _audioOnly: Boolean(audioOnly),
        _videoMediaType: getLocalVideoType(tracks),
        _audioMuted: isLocalTrackMuted(tracks, MEDIA_TYPE.AUDIO)
    };
}

export default connect(_mapStateToProps)(Toolbox);
