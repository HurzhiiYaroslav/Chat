export const LogsLoading = () => {
    return (
        <svg
            style={{ margin: '0 auto', display: 'block', shapeRendering: 'auto' }}
            width="50px" height="20px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid"
        >
            <circle cx="25" cy="50" fill="#85a2b6" r="30">
                <animate attributeName="cx" repeatCount="indefinite" dur="1.3157894736842106s" keyTimes="0;0.5;1" values="25;50;25" begin="-0.6578947368421053s"></animate>
            </circle>
            <circle cx="50" cy="50" fill="#bbcedd" r="30">
                <animate attributeName="cx" repeatCount="indefinite" dur="1.3157894736842106s" keyTimes="0;0.5;1" values="25;50;25" begin="0s"></animate>
            </circle>
            <circle cx="25" cy="50" fill="#85a2b6" r="30">
                <animate attributeName="cx" repeatCount="indefinite" dur="1.3157894736842106s" keyTimes="0;0.5;1" values="25;50;25" begin="-0.6578947368421053s"></animate>
                <animate attributeName="opacity" values="0;0;1;1" calcMode="discrete" keyTimes="0;0.499;0.5;1" dur="1.3157894736842106s" repeatCount="indefinite"></animate>
            </circle>
        </svg>
    );
};