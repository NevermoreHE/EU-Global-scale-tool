export const environment = {
    apiUrl: 'http://nix:8102/',
    apiKey: 'ext_d13492ce-bc30-43ca-ab7d-db7c62becf52',
    websocket: 'ws://nix:8102/ws/chat',
    vensimUrl: 'http://everest:8056',
    scenarios:{
        scenario:'scenario',
        save_series: 'scenario/{id}/policies',
    },
    vensim:{
        calculate: '/calculate',
        series: '/series',
        indicators:'/indicators',
        status: '/calculate/status'
    },
    chat: 'chat',
};
