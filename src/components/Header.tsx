import { AlignJustify, BellDot } from 'lucide-react'

const Header = () => {
  return (
    <header className="fixed z-40 w-full h-24 top-0">
      <div className="w-full h-24 flex bg-white py-4">
        <div className="hidden xl:flex w-52 h-full justify-center items-center">
          <img src="/assets/logo.svg" alt="EliMoney" width={120} height={40} />
        </div>

        <div className="w-full flex justify-between items-center px-6 md:px-10">
          <div className="flex xl:hidden h-full justify-center items-center">
            <AlignJustify size={24} className="text-gray" />
          </div>

          <h1 className="text-xl md:text-2xl text-gray font-semibold">
            Dashboard
          </h1>
          <div className="flex justify-center items-center">
            <div className="hidden md:flex w-12 h-12 bg-lightGray rounded-full p-1 justify-center items-center">
              <BellDot size={25} className="text-gray" />
            </div>
            <div>
              {/* {false ? (
                <>
                  <div className="hidden md:block">
                    <Image
                      src=""
                      alt="User avatar"
                      width={56}
                      height={56}
                      className="rounded-full  ml-6"
                    />
                  </div>
                  <div className="block md:hidden">
                    <Image
                      src=""
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="rounded-full"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="block md:hidden w-14 h-14 rounded-full bg-lightGray ml-6" />
                  <div className="hidden md:block w-9 h-9 rounded-full bg-lightGray" />
                </>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
