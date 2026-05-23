const LoadingDots = ({text = "Loading"}) => {

    return (

        <div className="flex items-center justify-center gap-1 text-sm font-medium text-white">

            <span>{text}</span>

            <div className="flex gap-1 mt-2">

                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>

                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>

                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
              
            </div>

        </div>

    );

};

export default LoadingDots;