const promise = require('promised-io/promise');
const request = require('superagent');

module.exports = class Twitch
{
    constructor(clientID)
    {
        this._client_id = clientID;
    }

    /**
     * Searches for a channel by name and returns first entry if found or null
     *
     * @param name
     * @return Promise<Object>
     */
    getChannelIDByName(name)
    {
        let deferred = promise.defer();
        let requestUrl = `https://api.twitch.tv/kraken/search/channels?query=${name}&client_id=${this._client_id}`;

        request(requestUrl, async (error, response) => {
            if (response.statusCode === 200) {
                deferred.resolve(response.body.channels && response.body.channels[0] ? response.body.channels[0] : null);
            } else {
                deferred.reject(response);
            }
        });
        return deferred.promise;
    }

    /**
     * Gets live stream object specified by twitch channel name
     * returns null if stream is not live
     *
     * @param channelName
     * @return Promise<Object>
     */
    getLiveStreamByChannelName(channelName)
    {
        let deferred = promise.defer();
        let requestUrl = `https://api.twitch.tv/kraken/streams/${channelName}/?client_id=${this._client_id}&stream_type=live`;

        request(requestUrl, async (error, response) => {
            if (response && response.statusCode === 200) {
                deferred.resolve(response.body.stream);
            } else {
                if (response.statusCode === 504) deferred.resolve(null);
                else deferred.reject(response);
            }
        });
        return deferred.promise;
    }
};