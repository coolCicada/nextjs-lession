import Image from "next/image"

export const ShoeCard = ({ imgURL, changeBigShoeImage, bigShoeImg }: any) => {
    const handleClick = () => {
        if (bigShoeImg !== imgURL.bigShoe) {
            changeBigShoeImage(imgURL.bigShoe);
        }
    };
    return (
        <div
            className={`border-2 rounded-xl cursor-pointer max-sm:flex-1
            ${
                bigShoeImg === imgURL.bigShoe
                    ? 'border-coral-red'
                    : 'border-transparent'
                }`}
            onClick={handleClick}
        >
            <div className="flex justify-center items-center bg-card bg-center bg-cover sm:w-40 sm:h-40 rounded-xl">
                <Image
                    src={imgURL.thumbnail}
                    alt='shoe colletion'
                    width={127}
                    height={103.34}
                    className='object-contain'
                />
            </div>
        </div>
    )
}
