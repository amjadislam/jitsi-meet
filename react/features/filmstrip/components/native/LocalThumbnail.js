// @flow

import React from 'react';
import { View } from 'react-native';

import Thumbnail from './Thumbnail';
import styles from './styles';

/**
 * Component to render a local thumbnail that can be separated from the
 * remote thumbnails later.
 *
 * @returns {ReactElement}
 */
export default function LocalThumbnail() {
    return (
        <View
            pointerEvents = { 'none' }
            style = {{
                ...styles.localThumbnail,
                width: '100%',
                height: '100%',
                position: 'absolute'
            }}>
            <Thumbnail disableTint = { true } />
        </View>
    );
}
