import Image from "next/image";

type User ={
    id: string
    name:string
    image: string
}

interface UserlistProps{
    users: User[]
    selectedUser: User|null
    onSelectUser: (user:User)=> void
}

function UserList({users, selectedUser,onSelectUser}: UserlistProps) {
    return (
      <div className="p-2">
        <h2 className="text-xl font-bold p-2 mb-2 border-b text-green-700">
          Online Users
        </h2>
        {users.map((user) => (
          <div
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`flex items-center p-3 rounded-xl cursor-pointer transition duration-150 border-l-4 ${
              selectedUser?.id === user.id
                ? "bg-green-100 border-green-600"
                : "hover:bg-gray-50 border-transparent"
            }`}
          >
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image
                src={user.image || "/dp.jpeg"}
                alt={user.name || "User"}
                fill
                className="rounded-full object-cover"
              />
            </div>

            <div className="ml-3">
              <p className="font-semibold text-gray-800 truncate max-w-[150px]">
                {user.name || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500">Click to start chat</p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-center text-gray-500 mt-4 text-sm">
            No other users are available to chat.
          </p>
        )}
      </div>
    );
}

export default UserList