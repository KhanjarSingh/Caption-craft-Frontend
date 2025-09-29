/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from 'remotion/config';
import { enableTailwind } from '@remotion/tailwind-v4';
import type { Configuration as WebpackConfiguration } from 'webpack';

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig((currentConfiguration) => {
  return {
    ...enableTailwind(currentConfiguration),
    output: {
      path: `${process.cwd()}/dist`,
      publicPath: '/'
    }
  };
});
