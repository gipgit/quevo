import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import CopyButton from '@/components/CopyButton';

interface ServiceBoard {
  board_id: string;
  board_title: string;
  board_description: string | null;
  board_ref: string;
  status: string;
  created_at: Date;
  business_name: string;
  business_urlname: string;
  user_id: string;
  name_first: string | null;
  name_last: string | null;
}

export default async function DemoBoardsPage() {
  const t = await getTranslations('DemoBoards');
  
  // Fetch all service boards with valid business references
  const serviceBoards = await prisma.$queryRaw<ServiceBoard[]>`
    SELECT 
      sb.board_id,
      sb.board_title,
      sb.board_description,
      sb.board_ref,
      sb.status,
      sb.created_at,
      b.business_name,
      b.business_urlname,
      uc.user_id,
      uc.name_first,
      uc.name_last
    FROM serviceboard sb
    INNER JOIN business b ON sb.business_id = b.business_id
    INNER JOIN usercustomer uc ON sb.customer_id = uc.user_id
    ORDER BY sb.created_at DESC
  `;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Demo Service Boards
          </h1>
          <p className="text-gray-600">
            Browse and test all available service boards
          </p>
        </div>

        {/* Service Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceBoards.map((board) => (
            <div
              key={board.board_id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {board.board_title}
                </h3>
                {board.board_description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {board.board_description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {board.status}
                  </span>
                  <span>
                    {new Date(board.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Business:</span>
                    <p className="text-sm text-gray-900">{board.business_name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Customer:</span>
                    <p className="text-sm text-gray-900">
                      {board.name_first || 'N/A'} {board.name_last || ''}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Board Ref:</span>
                    <p className="text-sm text-gray-900 font-mono">{board.board_ref}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Link
                    href={`/${board.business_urlname}/s/${board.board_ref}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
                  >
                    Open Board
                  </Link>
                  <CopyButton boardRef={board.board_ref} businessUrlname={board.business_urlname} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {serviceBoards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Service Boards Found
            </h3>
            <p className="text-gray-600">
              There are no service boards available in the database.
            </p>
          </div>
        )}

        {/* Stats */}
        {serviceBoards.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Total Service Boards: <span className="font-semibold text-gray-900">{serviceBoards.length}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
