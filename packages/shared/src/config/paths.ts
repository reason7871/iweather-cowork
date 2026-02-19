/**
 * Centralized path configuration for iWeather.
 *
 * Supports multi-instance development via IWEATHER_CONFIG_DIR environment variable.
 * When running from a numbered folder, the script sets IWEATHER_CONFIG_DIR to
 * ~/.iweather-1, allowing multiple instances to run simultaneously with separate configurations.
 *
 * Default (non-numbered folders): ~/.iweather/
 * Instance 1 (-1 suffix): ~/.iweather-1/
 * Instance 2 (-2 suffix): ~/.iweather-2/
 */

import { homedir } from 'os';
import { join } from 'path';

// Allow override via environment variable for multi-instance dev
// Falls back to default ~/.iweather/ for production and non-numbered dev folders
export const CONFIG_DIR = process.env.IWEATHER_CONFIG_DIR || join(homedir(), '.iweather');
