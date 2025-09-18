"use client"

import { useState } from "react"
import type { Activity } from "@/lib/activities"

interface ActivityDetailModalProps {
  activity: Activity | null
  isOpen: boolean
  onClose: () => void
}

export default function ActivityDetailModal({ activity, isOpen, onClose }: ActivityDetailModalProps) {
  if (!isOpen || !activity) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return "-"
    return timeString.slice(0, 5) // Remove seconds
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-green-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-green-600"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Detail Aktivitas</h3>
                <div className="mt-2">
                  <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tanggal Berangkat</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {activity.tgl_berangkat ? formatDate(activity.tgl_berangkat) : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tanggal Pulang</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {activity.tgl_pulang ? formatDate(activity.tgl_pulang) : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Ambulan (No Plat)</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.ambulance.nopol || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Detail</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.detail || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Jam Berangkat</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {activity.jam_berangkat ? formatTime(activity.jam_berangkat) : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Jam Pulang</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {activity.jam_pulang ? formatTime(activity.jam_pulang) : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Jenis</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.tipe || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Asisten Luar Kota</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.asisten_luar_kota || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Area</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.area || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Dari</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.dari || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tujuan</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.tujuan || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Nama Pemesan</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.nama_pemesan || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">HP</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.hp || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Nama PM</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.nama_pm || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Alamat PM</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.alamat_pm || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Jenis Kelamin PM</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.jenis_kelamin_pm || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Usia PM</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.usia_pm || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Asnaf</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.id_asnaf || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">NIK</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.nik || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">No KK</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.no_kk || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tempat Lahir</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.tempat_lahir || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tanggal Lahir</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {activity.tgl_lahir ? formatDate(activity.tgl_lahir) : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status Marital</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.status_marital || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Kegiatan</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.kegiatan || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Rumpun Program</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.rumpun_program || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">KM Awal</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.km_awal || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">KM Akhir</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.km_akhir || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Biaya Antar</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {activity.reward > 0 ? `Rp ${activity.reward.toLocaleString("id-ID")}` : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Infaq Dibayar</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {(activity.biaya_dibayar || 0) > 0 ? `Rp ${(activity.biaya_dibayar || 0).toLocaleString("id-ID")}` : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Infaq</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {(activity.infaq || 0) > 0 ? `Rp ${(activity.infaq || 0).toLocaleString("id-ID")}` : "-"}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Diagnosa Sakit</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.diagnosa_sakit || "-"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Agama</h4>
                      <p className="mt-1 text-sm text-gray-900">{activity.agama || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
